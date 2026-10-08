// Smoke/interaction test for /mis (ข้อมูลพื้นฐาน › ประชากร) — run: node scripts/mis-smoke.mjs [baseUrl]
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.env.SHOT_DIR ?? ".";
const data = JSON.parse(readFileSync(new URL("../public/data/mis/population.json", import.meta.url), "utf8"));
const p13 = data.hdc.cube.reduce((a, r) => a + r[6], 0);
const p4 = data.hdc.cube.reduce((a, r) => a + r[10], 0);
const bora = data.bora.prov["1"].concat(data.bora.prov["2"]).reduce((a, b) => a + b, 0);
const th = (n) => n.toLocaleString("th-TH");

const browser = await chromium.launch();
const fails = [];
const check = (cond, msg) => (cond ? console.log("  ✓", msg) : (fails.push(msg), console.log("  ✗", msg)));

// CountUp animates numbers — poll until the expected text settles.
const hasText = async (page, t, ms = 6000) => {
  await page.locator("[data-testid=pop-view-hdc] section, [data-testid=pop-view-hdc] > div > div").first().scrollIntoViewIfNeeded();
  return page.waitForFunction((x) => document.body.innerText.includes(x), t, { timeout: ms }).then(() => true, () => false);
};

const TABS = [
  ["hdc", "ประชากร HDC"],
  ["bora", "ทะเบียนราษฎร"],
  ["compare", "เปรียบเทียบ HDC × ทะเบียนราษฎร"],
  ["le", "LE / HALE"],
  ["quality", "คุณภาพข้อมูล"],
];

async function scrollAll(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

async function run(name, viewport) {
  console.log(`\n[${name}] ${viewport.width}x${viewport.height}`);
  const page = await browser.newPage({ viewport, deviceScaleFactor: viewport.width < 500 ? 2 : 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}/mis`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=pop-view-hdc]", { timeout: 15000 });
  await page.waitForTimeout(1200);

  check((await page.locator("h1").innerText()).includes("ประชากร"), "hero title");
  check((await page.locator("aside").first().locator("text=ข้อมูลพื้นฐาน").count()) === 1, "sidebar category ข้อมูลพื้นฐาน");
  check((await page.locator("text=องค์ประกอบประชากรตาม TYPEAREA 1–4").count()) === 1, "TYPEAREA 1–4 panel renders");
  check(await hasText(page, th(p4)), `TYPEAREA 4 distinct CID ${th(p4)} shown`);
  check(await hasText(page, th(p13)), `HDC province total ${th(p13)} shown (CID dedup, TYPEAREA 1,3)`);

  for (const [key, label] of TABS) {
    await page.locator("[role=tab]", { hasText: label }).first().click();
    await page.waitForSelector(`[data-testid=pop-view-${key}]`);
    await page.waitForTimeout(700);
    await scrollAll(page);
    const view = page.locator(`[data-testid=pop-view-${key}]`);
    const panels = await view.locator("section").count();
    const notes = await view.locator("text=แหล่งที่มา").count();
    const methods = await view.locator("text=วิธีคิด").count();
    check(panels > 0 && notes >= panels - 0 && methods === notes, `[${key}] every panel has แหล่งที่มา + วิธีคิด (${panels} panels, ${notes} notes)`);
    const charts = await view.locator(".recharts-surface").count();
    if (key !== "quality") check(charts > 0, `[${key}] charts render (${charts})`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, `[${key}] no horizontal page overflow (${overflow}px)`);
    if (key === "bora") check((await view.locator(`text=${th(bora)}`).count()) > 0, `[bora] BORA total ${th(bora)} shown`);
    if (key === "le") {
      const txt = await view.innerText();
      const m = txt.match(/LE แรกเกิด \(รวมเพศ\)\s*([\d.]+)/);
      const e0 = m ? Number(m[1]) : NaN;
      check(e0 > 65 && e0 < 85, `[le] LE0 plausible (${e0})`);
      check(txt.includes("Chiang") && txt.includes("Sullivan"), "[le] method names Chiang II + Sullivan");
    }
    await page.screenshot({ path: `${out}/mis-${name}-${key}.png`, fullPage: true });
  }

  // Filters: choose one amphoe on HDC tab → total must change to amphoe-level (smaller)
  await page.locator("[role=tab]", { hasText: "ประชากร HDC" }).first().click();
  await page.waitForTimeout(600);
  const before = await page.locator("[data-testid=pop-view-hdc]").innerText();
  await page.getByRole("button", { name: "มะนัง", exact: true }).click();
  await page.waitForTimeout(700);
  const after = await page.locator("[data-testid=pop-view-hdc]").innerText();
  check(before !== after && (await page.locator("text=ภาพอำเภอ").count()) > 0, "amphoe filter switches to ภาพอำเภอ and updates figures");
  await page.getByRole("tab", { name: "หญิง", exact: true }).first().click();
  await page.waitForTimeout(500);
  check((await page.locator("[data-testid=pop-view-hdc]").innerText()) !== after, "sex filter updates figures");
  await page.getByRole("tab", { name: "4 นอกเขต", exact: true }).click();
  await page.waitForTimeout(600);
  check((await page.locator("[data-testid=pop-view-hdc]").innerText()).includes("TYPEAREA 4 (อาศัยนอกเขต"), "TYPEAREA 4 filter switches dataset");
  await page.locator("text=ล้างตัวกรอง").click();
  await page.waitForTimeout(500);
  check(await hasText(page, th(p13)), "reset filters restores province total");

  if (viewport.width < 1024) {
    await page.locator("button[aria-label='เปิดเมนู']").click();
    await page.waitForTimeout(450);
    check(await page.locator("aside.fixed").isVisible(), "mobile drawer opens");
  }

  const real = errors.filter((e) => !/favicon/i.test(e));
  check(real.length === 0, `no console/page errors${real.length ? ": " + real.slice(0, 3).join(" | ") : ""}`);
  await page.close();
}

await run("desktop", { width: 1512, height: 950 });
await run("tablet", { width: 820, height: 1180 });
await run("mobile", { width: 390, height: 844 });
await browser.close();
console.log(fails.length ? `\nFAILED ${fails.length}` : "\nALL PASSED");
process.exit(fails.length ? 1 : 0);
