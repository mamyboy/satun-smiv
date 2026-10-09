#!/usr/bin/env node
/**
 * MIS Health · อัปเดตข้อมูลประชากร (HDC 43 แฟ้ม + ทะเบียนราษฎร BORA + LE/HALE BOD)
 * แยกต่างหากจาก scripts/update-data.sh (ซึ่งอัปเดตเฉพาะตัวชี้วัดโรค/amphoe-data) โดยตั้งใจ —
 * คนละแหล่งข้อมูล คนละความถี่ในการอัปเดต คนละ commit
 *
 * HDC และ BORA ต้องใช้เบราว์เซอร์จริง (ไม่ใช่ curl):
 *   - hippo.moph.go.th ต้องล็อกอิน Jupyter ของกระทรวง (SSO) ก่อน
 *   - stat.bora.dopa.go.th มี WAF บล็อกการเรียกตรงจากเซิร์ฟเวอร์ ต้อง fetch จากในหน้าเว็บเท่านั้น
 * สคริปต์นี้ใช้ Playwright แบบ persistent profile (เก็บ cookie ไว้ที่ .mis-browser-profile/)
 * รันครั้งแรกด้วย HEADFUL=true เพื่อล็อกอินมือ ครั้งต่อไปรันปกติ (headless) ได้จนกว่า session จะหมดอายุ
 * LE/HALE (BOD) เป็น Google Sheet สาธารณะ ดึงตรงด้วย fetch ธรรมดา ไม่ต้องใช้เบราว์เซอร์
 *
 * Usage:
 *   node scripts/mis-update-population.mjs                 # hdc + bora + bod + build
 *   node scripts/mis-update-population.mjs hdc|bora|bod|build
 *   node scripts/mis-update-population.mjs all --commit [--push]
 *   HEADFUL=true node scripts/mis-update-population.mjs hdc # เปิดหน้าต่างไว้ล็อกอินครั้งแรก/ตอน session หมดอายุ
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW = path.join(ROOT, "data", "mis-raw");
const PROFILE_DIR = path.join(ROOT, ".mis-browser-profile");
const HEADLESS = process.env.HEADFUL !== "true";
const LOG = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const SQL = {
  cube: readFileSync(path.join(ROOT, "scripts/sql/mis-population-hdc.sql"), "utf8"),
  village: readFileSync(path.join(ROOT, "scripts/sql/mis-population-hdc-village.sql"), "utf8"),
  attr: readFileSync(path.join(ROOT, "scripts/sql/mis-population-hdc-attr.sql"), "utf8"),
  household: readFileSync(path.join(ROOT, "scripts/sql/mis-population-hdc-household.sql"), "utf8"),
};

// ---------------------------------------------------------------- browser helper
async function withBrowser(fn) {
  mkdirSync(PROFILE_DIR, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: HEADLESS, viewport: { width: 1400, height: 900 } });
  try {
    const page = ctx.pages()[0] ?? (await ctx.newPage());
    return await fn(page, ctx);
  } finally {
    await ctx.close();
  }
}

/** รอให้ผู้ใช้ล็อกอิน/ยืนยันในหน้าต่างเบราว์เซอร์ (เฉพาะ HEADFUL) แล้วกด Enter ที่ terminal */
async function pauseForManualLogin(reason) {
  if (HEADLESS) throw new Error(`${reason} — รันใหม่ด้วย HEADFUL=true เพื่อล็อกอินด้วยตนเองในหน้าต่างเบราว์เซอร์ แล้วค่อยรันแบบ headless ต่อไป`);
  LOG(`⏸  ${reason} — ล็อกอินในหน้าต่างที่เปิดอยู่ แล้วกด Enter ที่ terminal นี้เพื่อทำต่อ...`);
  await new Promise((resolve) => process.stdin.once("data", resolve));
}

// ---------------------------------------------------------------- 1) HDC (hippo Jupyter)
const HIPPO_USER = process.env.HIPPO_USER ?? "pranot91";
const HIPPO_BASE = `/user/${HIPPO_USER}`;

async function jrun(page, code, { timeoutMs = 600000 } = {}) {
  return page.evaluate(
    async ({ base, code, timeoutMs }) => {
      const xsrf = (document.cookie.match(/_xsrf=([^;]+)/) || [])[1] || "";
      const H = { "X-XSRFToken": decodeURIComponent(xsrf) };
      const ks = await (await fetch(base + "/api/kernels", { headers: H })).json();
      let kid;
      if (!ks.length) {
        const k = await (
          await fetch(base + "/api/kernels", { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ name: "python3" }) })
        ).json();
        kid = k.id;
      } else {
        ks.sort((a, b) => (b.last_activity || "").localeCompare(a.last_activity || ""));
        kid = ks[0].id;
      }
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(proto + "//" + location.host + base + "/api/kernels/" + kid + "/channels");
      const msgId = "m" + Math.random().toString(36).slice(2);
      let out = "";
      return await new Promise((resolve) => {
        const timer = setTimeout(() => {
          try {
            ws.close();
          } catch {
            /* noop */
          }
          resolve({ status: "TIMEOUT", out });
        }, timeoutMs);
        ws.onerror = () => {
          clearTimeout(timer);
          resolve({ status: "WS_ERROR", out });
        };
        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              header: { msg_id: msgId, username: "h", session: "s" + msgId, msg_type: "execute_request", version: "5.3" },
              parent_header: {},
              metadata: {},
              content: { code, silent: false, store_history: false, user_expressions: {}, allow_stdin: false, stop_on_error: true },
              channel: "shell",
            }),
          );
        };
        ws.onmessage = (ev) => {
          const m = JSON.parse(ev.data);
          if (!m.parent_header || m.parent_header.msg_id !== msgId) return;
          const t = m.header.msg_type;
          if (t === "stream") out += m.content.text;
          else if (t === "execute_result" || t === "display_data") out += (m.content.data["text/plain"] || "") + "\n";
          else if (t === "error") out += "ERROR: " + m.content.ename + ": " + m.content.evalue + "\n";
          else if (t === "status" && m.content.execution_state === "idle") {
            clearTimeout(timer);
            ws.close();
            resolve({ status: "ok", out });
          }
        };
      });
    },
    { base: HIPPO_BASE, code, timeoutMs },
  );
}

/** ดึงผลคำสั่ง python ที่ print(json.dumps(...)) กลับมาเป็น object; จัดการ IOPub rate-limit ด้วยการพักข้อความใน kernel แล้วอ่านเป็นช่วง */
async function jrunJson(page, pyBuildExpr, { timeoutMs = 900000, chunk = 500000 } = {}) {
  const store = `
import json
_MIS_OUT = json.dumps(${pyBuildExpr}, default=str, ensure_ascii=True)
print(len(_MIS_OUT))
`;
  const r1 = await jrun(page, store, { timeoutMs });
  if (r1.status !== "ok") throw new Error(`jrunJson store failed: ${r1.status} ${r1.out.slice(0, 500)}`);
  const n = parseInt(r1.out.trim().split("\n").pop(), 10);
  if (!Number.isFinite(n)) throw new Error(`jrunJson: unexpected length output: ${r1.out.slice(0, 500)}`);
  let buf = "";
  for (let i = 0; i < n; i += chunk) {
    const r = await jrun(page, `print(_MIS_OUT[${i}:${i + chunk}], end='')`, { timeoutMs: 60000 });
    if (r.status !== "ok") throw new Error(`jrunJson chunk failed at ${i}: ${r.status}`);
    buf += r.out;
    await new Promise((res) => setTimeout(res, 2500)); // เลี่ยง IOPub data-rate limit ของ Jupyter
  }
  return JSON.parse(buf);
}

async function fetchHdc(page) {
  LOG("HDC: เปิด hippo Jupyter และต่อ DuckDB ...");
  await page.goto(`https://hippo.moph.go.th${HIPPO_BASE}/tree`, { waitUntil: "domcontentloaded" });
  if (page.url().includes("login") || page.url().includes("auth")) {
    await pauseForManualLogin("ต้องล็อกอิน hippo.moph.go.th (SSO กระทรวง)");
    await page.goto(`https://hippo.moph.go.th${HIPPO_BASE}/tree`, { waitUntil: "domcontentloaded" });
  }

  const connectCheck = await jrun(page, "import hdc\ntry:\n    c = hdc.get_connection(); print('OK', c.execute('select 1').fetchone())\nexcept Exception as e:\n    print('NEED_CONNECT', e)", { timeoutMs: 30000 });
  if (!connectCheck.out.includes("OK")) {
    LOG("  ไม่มีการเชื่อมต่อ DuckDB อยู่ก่อน พยายาม hdc.connect() ...");
    const conn = await jrun(page, "import hdc\nhdc.connect()\nprint('connected')", { timeoutMs: 60000 });
    if (!conn.out.includes("connected")) {
      throw new Error(`hdc.connect() ไม่สำเร็จ (อาจมี session อื่นถือ lock DuckDB อยู่ — ต้องปิดก่อน): ${conn.out.slice(0, 600)}`);
    }
  }

  LOG("  รันคิวรี cube/village/attr/household ...");
  const out = await jrunJson(
    page,
    `{
  "cube": (lambda r: {"cols": [d[0] for d in r.description], "rows": r.fetchall()})(hdc.get_connection().execute(${JSON.stringify(SQL.cube)})),
  "village": (lambda r: {"cols": [d[0] for d in r.description], "rows": r.fetchall()})(hdc.get_connection().execute(${JSON.stringify(SQL.village)})),
  "attr": (lambda r: {"cols": [d[0] for d in r.description], "rows": r.fetchall()})(hdc.get_connection().execute(${JSON.stringify(SQL.attr)})),
  "household": (lambda r: {"cols": [d[0] for d in r.description], "rows": r.fetchall()})(hdc.get_connection().execute(${JSON.stringify(SQL.household)})),
}`,
  );

  LOG("  ดึงตารางอ้างอิง (อำเภอ/ตำบล/หมู่บ้าน/หน่วยบริการ/lookup/คุณภาพข้อมูล) ...");
  const meta = await jrunJson(
    page,
    `(lambda c: {
  "hosp": c.execute("select h.HOSCODE, h.HOSNAME, h.HOSTYPE, ch.DISTCODE, h.TAMBON from chospital h join campur ch on ch.AMPURCODEFULL = h.PROVCODE || h.DISTCODE where h.PROVCODE='91'").fetchall(),
  "amp": c.execute("select AMPURCODE, AMPURNAME from campur where AMPURCODEFULL like '91%'").fetchall(),
  "tmb": c.execute("select ctambon.TAMBONCODEFULL, ctambon.TAMBONNAME from ctambon where ctambon.TAMBONCODEFULL like '91%'").fetchall(),
  "vil": c.execute("select VILLAGECODEFULL, VILLAGENAME from cvillage where VILLAGECODEFULL like '91%'").fetchall(),
  "lk": {t: c.execute("select * from " + t).fetchall() for t in ["creligion","cabogroup","crhgroup","cmstatus","ceducation","chostype","ctypearea","csex","cnation","crace","coccupation_new"]},
  "quality": (lambda q: {
    "person_rows": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91'\")[0][0],
    "typearea_rows": q(\"select coalesce(p.TYPEAREA,''), count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' group by 1 order by 1\"),
    "thai_alive_13_rows": list(q(\"select count(*), count(distinct CID) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3')\")[0]),
    "thai_alive_12_rows": list(q(\"select count(*), count(distinct CID) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','2')\")[0]),
    "cid_multi_unit_13": q(\"select count(*) from (select CID from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') group by CID having count(distinct p.HOSPCODE)>1)\")[0][0],
    "cid_multi_amp_13": q(\"select count(*) from (select CID from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') group by CID having count(distinct ch.DISTCODE)>1)\")[0][0],
    "bad_birth_13": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') and (p.BIRTH is null or year(p.BIRTH)<1906 or p.BIRTH>current_date)\")[0][0],
    "no_home_13": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' left join home h on h.HOSPCODE=p.HOSPCODE and h.HID=p.HID where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') and h.HID is null\")[0][0],
    "home_out_prov_13": 0,
    "home_bad_village_13": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' join home h on h.HOSPCODE=p.HOSPCODE and h.HID=p.HID left join cvillage cv on cv.VILLAGECODEFULL=h.CHANGWAT||h.AMPUR||h.TAMBON||h.VILLAGE where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') and cv.VILLAGECODEFULL is null\")[0][0],
    "sex_other_13": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') and p.SEX not in ('1','2')\")[0][0],
    "nation_13": q(\"select coalesce(NATION,''), count(distinct CID) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is not null and p.DISCHARGE='9' and p.TYPEAREA in ('1','3') group by 1 order by 2 desc limit 25\"),
    "max_d_update": str(q(\"select max(D_UPDATE) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91'\")[0][0]),
    "hdc_date": str(q(\"select current_timestamp\")[0][0]),
    "null_cid_13": q(\"select count(*) from person p join chospital ch on ch.HOSCODE=p.HOSPCODE and ch.PROVCODE='91' where p.CID is null and p.NATION='099' and p.DISCHARGE='9' and p.TYPEAREA in ('1','3')\")[0][0],
  })(lambda q: c.execute(q).fetchall()),
})(hdc.get_connection())`,
  );

  const raw = {
    cube: out.cube,
    village: out.village,
    attr: out.attr,
    household: out.household,
    household_meta: { home_rows_91: null, house_id_filled: 0 },
    hosp: meta.hosp.map((r) => [r[0], r[1], r[2], r[3], r[4]]),
    amp: meta.amp,
    tmb: meta.tmb,
    vil: meta.vil,
    lk: meta.lk,
    quality: meta.quality,
  };
  mkdirSync(RAW, { recursive: true });
  writeFileSync(path.join(RAW, "hdc-population.json"), JSON.stringify(raw));
  LOG(`HDC: เขียน data/mis-raw/hdc-population.json แล้ว (cube ${raw.cube.rows.length} แถว)`);
}

// ---------------------------------------------------------------- 2) BORA (ทะเบียนราษฎร)
const BORA_URL = "https://stat.bora.dopa.go.th/stat/statnew/statMONTH/statmonth/#/view";
const CC = "91";

async function boraFetch(page, api) {
  for (let i = 0; i < 3; i++) {
    const text = await page.evaluate(
      async (a) => fetch("../../connectSAPI/stat_forward.php?API=" + a).then((r) => r.text()),
      api,
    );
    if (text.startsWith("[") || text.startsWith("{")) return JSON.parse(text);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`BORA API ไม่สำเร็จ: ${api}`);
}

function yymmRange(from, to) {
  const out = [];
  let y = Math.floor(from / 100), m = from % 100;
  while (y * 100 + m <= to) {
    out.push(y * 100 + m);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

async function fetchBora(page) {
  LOG("BORA: เปิด stat.bora.dopa.go.th ...");
  await page.goto(BORA_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const POP = (yymm, extra = "") => `/api/statpophouse/v1/statpop/list?action=23${yymm ? `&yymm=${yymm}` : ""}&nat=99&popst=0&cc=${CC}${extra}`;
  const now = new Date();
  const latest = Number(`${String(now.getFullYear() - 2500 + 2543).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}`); // ปปดด ปัจจุบัน (ตรวจซ้ำด้านล่าง)

  // หาเดือนล่าสุดที่มีข้อมูลจริง (ไล่ถอยจากเดือนปัจจุบันจนกว่าจะไม่ error)
  let ym = latest;
  let provAll;
  for (let tries = 0; tries < 4; tries++) {
    try {
      provAll = await boraFetch(page, encodeURIComponent(POP(ym).replace("nat=99&popst=0", "nat=999&popst=99")));
      break;
    } catch {
      ym = ym % 100 === 1 ? ym - 89 : ym - 1;
    }
  }
  if (!provAll) throw new Error("BORA: หาเดือนล่าสุดที่มีข้อมูลไม่สำเร็จ");

  const popBySex = (rows) => {
    const out = { 1: Array(101).fill(0), 2: Array(101).fill(0) };
    for (const r of rows) {
      const sex = String(r.lsageSex ?? r.SEX ?? r.sex);
      const bucket = sex === "1" || sex === "2" ? out[sex] : null;
      if (!bucket) continue;
      for (let a = 0; a <= 101; a++) {
        const v = r[`lsAge${a}`] ?? 0;
        bucket[Math.min(a, 100)] += v;
      }
    }
    return out;
  };

  const provThaiRows = await boraFetch(page, encodeURIComponent(POP(ym)));
  const provAllRows = provAll;
  const provCentralRows = await boraFetch(page, encodeURIComponent(POP(ym).replace("popst=0", "popst=1")));
  const provMovingRows = await boraFetch(page, encodeURIComponent(POP(ym).replace("popst=0", "popst=2")));

  const offices = await boraFetch(page, encodeURIComponent(`/api/stat/statcenter/v1/list?action=2&cc=${CC}`));
  const officeThai = {};
  for (const o of offices) {
    const rows = await boraFetch(page, encodeURIComponent(POP(ym, `&rcode=${o.rcode}`).replace("action=23", "action=24")));
    officeThai[o.rcode] = popBySex(rows);
    await new Promise((r) => setTimeout(r, 300));
  }

  const tambonThai = [];
  for (const o of offices) {
    const rows = await boraFetch(page, encodeURIComponent(POP(ym, `&rcode=${o.rcode}`).replace("action=23", "action=25")));
    const byTt = new Map();
    for (const r of rows) {
      const key = r.lstt ?? r.tt;
      if (!byTt.has(key)) byTt.set(key, { rcode: o.rcode, aa: String(o.aa?.[0] ?? ""), tt: String(key), name: r.lsttDesc ?? r.ttDesc ?? "", ages: { 1: Array(101).fill(0), 2: Array(101).fill(0) } });
      const cur = byTt.get(key);
      const sex = String(r.lsageSex ?? r.SEX ?? r.sex);
      if (sex === "1" || sex === "2") for (let a = 0; a <= 101; a++) cur.ages[sex][Math.min(a, 100)] += r[`lsAge${a}`] ?? 0;
    }
    tambonThai.push(...byTt.values());
    await new Promise((r) => setTimeout(r, 300));
  }

  const months = yymmRange(ym - 36, ym); // 3 ปีล่าสุด เพียงพอสำหรับ LE/HALE แบบ pooled
  const popMonthThai = {};
  for (const m of months) {
    try {
      popMonthThai[m] = popBySex(await boraFetch(page, encodeURIComponent(POP(m))));
    } catch {
      /* เดือนที่ไม่มีข้อมูล ข้ามไป */
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const deathAgeMonth = {};
  const vitalMonth = { statbirth: [], statdeath: [], statmovein: [], statmoveout: [] };
  const TRAN = (src, action, m) => `/api/stattranall/v1/${src}/list?action=${action}&yymmBegin=${m}&yymmEnd=${m}&statType=1&statSubType=999&subType=99&cc=${CC}`;
  for (const m of months) {
    try {
      const d = await boraFetch(page, encodeURIComponent(TRAN("statdeath", 71, m)));
      deathAgeMonth[m] = popBySex(d);
    } catch {
      /* ข้าม */
    }
    for (const [key, src, action] of [
      ["statbirth", "statbirth", 13],
      ["statdeath", "statdeath", 13],
      ["statmovein", "statmovein", 13],
      ["statmoveout", "statmoveout", 13],
    ]) {
      try {
        const rows = await boraFetch(page, encodeURIComponent(TRAN(src, action, m)));
        if (rows[0]) vitalMonth[key].push({ ...rows[0], lsyymm: m });
      } catch {
        /* ข้าม */
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  const HOUSE = (action, m, extra = "") => `/api/statpophouse/v1/stathouse/list?action=${action}&yymmBegin=${m}&yymmEnd=${m}&statType=0&statSubType=999&subType=99&cc=${CC}${extra}`;
  const houseOffRows = await boraFetch(page, encodeURIComponent(HOUSE(33, ym)));
  const houseOffice = {};
  for (const r of houseOffRows) houseOffice[r.lsrcode] = r.lssumnotTermDate;
  const houseTambon = {};
  for (const o of offices) {
    const rows = await boraFetch(page, encodeURIComponent(HOUSE(34, ym, `&rcode=${o.rcode}`)));
    houseTambon[o.rcode] = rows.map((r) => [r.lstt, r.lsttDesc, r.lssumnotTermDate]);
    await new Promise((r) => setTimeout(r, 300));
  }
  const houseMonth = [];
  for (const m of months) {
    try {
      const rows = await boraFetch(page, encodeURIComponent(HOUSE(33, m)));
      houseMonth.push([m, rows.reduce((a, r) => a + r.lssumnotTermDate, 0)]);
    } catch {
      /* ข้าม */
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  const raw = {
    latest: ym,
    fetched: new Date().toISOString().slice(0, 16).replace("T", " "),
    offices,
    prov_thai: popBySex(provThaiRows),
    prov_all: popBySex(provAllRows),
    prov_central_thai: popBySex(provCentralRows),
    prov_moving_thai: popBySex(provMovingRows),
    office_thai: officeThai,
    tambon_thai: tambonThai,
    pop_month_thai: popMonthThai,
    death_age_month: deathAgeMonth,
    vital_month: vitalMonth,
    house: { office: houseOffice, tambon: houseTambon, month: houseMonth },
  };
  mkdirSync(RAW, { recursive: true });
  writeFileSync(path.join(RAW, "bora-population.json"), JSON.stringify(raw));
  LOG(`BORA: เขียน data/mis-raw/bora-population.json แล้ว (เดือนล่าสุด ${ym})`);
}

// ---------------------------------------------------------------- 3) BOD (LE/HALE) — ไม่ต้องใช้เบราว์เซอร์
async function fetchBod() {
  LOG("BOD: ดึง LE/HALE จาก Google Sheet สาธารณะ ...");
  const prev = JSON.parse(readFileSync(path.join(RAW, "le-hale-bod.json"), "utf8"));
  const sheetId = prev.sheetId;
  const sheets = { area_code: "area_code", country: "country", province: "province" };
  const out = { sheetId };
  for (const [key, name] of Object.entries(sheets)) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${name}&tq=${encodeURIComponent("SELECT *")}`;
    const text = await (await fetch(url)).text();
    const json = JSON.parse(text.replace(/^[^(]*\(/, "").replace(/\);?\s*$/, ""));
    const cols = json.table.cols.map((c) => c.label || c.id);
    out[key] = json.table.rows.map((r) => {
      const o = {};
      cols.forEach((c, i) => (o[c] = r.c[i]?.v ?? null));
      return o;
    });
  }
  writeFileSync(path.join(RAW, "le-hale-bod.json"), JSON.stringify(out));
  LOG(`BOD: เขียน data/mis-raw/le-hale-bod.json แล้ว (province ${out.province.length} แถว)`);
}

// ---------------------------------------------------------------- 4) build + commit
function runBuild() {
  LOG("BUILD: python3 scripts/mis-build-population.py ...");
  execSync("python3 scripts/mis-build-population.py", { cwd: ROOT, stdio: "inherit" });
}

function commitPopulation({ push }) {
  const diff = execSync("git status --porcelain -- data/mis-raw public/data/mis", { cwd: ROOT }).toString().trim();
  if (!diff) {
    LOG("COMMIT: ไม่มีการเปลี่ยนแปลงข้อมูลประชากร ไม่ต้อง commit");
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  execSync("git add data/mis-raw public/data/mis", { cwd: ROOT });
  execSync(`git commit -m ${JSON.stringify(`Refresh MIS population data (${today})\n\nAutomated update via scripts/mis-update-population.mjs (HDC + BORA + BOD).\nSeparate from scripts/update-data.sh (disease indicators).`)}`, { cwd: ROOT });
  LOG("COMMIT: บันทึก commit ข้อมูลประชากรแล้ว");
  if (push) {
    execSync("git push origin main", { cwd: ROOT, stdio: "inherit" });
    LOG("PUSH: push ขึ้น origin/main แล้ว");
  }
}

// ---------------------------------------------------------------- main
async function main() {
  const args = process.argv.slice(2);
  const task = args.find((a) => !a.startsWith("--")) ?? "all";
  const doCommit = args.includes("--commit");
  const doPush = args.includes("--push");

  if (task === "hdc" || task === "all") await withBrowser((page) => fetchHdc(page));
  if (task === "bora" || task === "all") await withBrowser((page) => fetchBora(page));
  if (task === "bod" || task === "all") await fetchBod();
  runBuild(); // รวมผลล่าสุดใน data/mis-raw เป็น public/data/mis/population.json เสมอ (รองรับ task === "build" ด้วย)

  if (doCommit) commitPopulation({ push: doPush });
  LOG("เสร็จสิ้น ✓");
}

main().catch((err) => {
  console.error("[mis-update-population] ล้มเหลว:", err.message);
  process.exit(1);
});
