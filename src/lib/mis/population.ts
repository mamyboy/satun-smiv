/**
 * ชั้นข้อมูล Dashboard ประชากร — ทุกตัวเลขคำนวณจาก public/data/mis/population.json
 * (สร้างโดย scripts/mis-build-population.py จากผล SQL HDC + API ทะเบียนราษฎร + ชีต BOD)
 */
import { LT_GROUPS, groupSingleAges, lifeTable, sullivanHale, type LifeTable, type HaleResult } from "./life-table";

// ------------------------------------------------------------------ types (ตรงกับ JSON)
export type SexArr = { "1": number[]; "2": number[] };
export interface Hosp { code: string; name: string; type: string; amp: string; tmb: string }
/** cube row: [hospIdx, typearea(1-4), sex(1|2|9), age(-1|0..100), u, a13, p13, a12, p12, a4, p4, p4x] */
export type CubeRow = [number, number, number, number, number, number, number, number, number, number, number, number];
/** village row: [villageCode8, sex, ageBand5(-1|0..20), v13, t13] */
export type VillageRow = [string, number, number, number, number];
/** attr row: [amp, key, code, sex, a13, p13] */
export type AttrRow = [string, string, string, number, number, number];

export interface PopulationData {
  meta: {
    province: string;
    provcode: string;
    hdc: { source: string; tables: string[]; dataDate: string; hdcDate: string; ageRefDate: string; sql: string[] };
    bora: { source: string; url: string; latest: number; fetched: string; popDefinition: string };
    bod: { source: string; url: string; sheetId: string };
  };
  hdc: {
    amp: { code: string; name: string }[];
    tmb: Record<string, string>;
    vil: Record<string, string>;
    hostype: Record<string, string>;
    hosp: Hosp[];
    cube: CubeRow[];
    village: VillageRow[];
    attr: AttrRow[];
    attrLabels: Record<string, Record<string, string>>;
    quality: Record<string, unknown> & {
      person_rows: number;
      typearea_rows: [string, number][];
      thai_alive_13_rows: [number, number];
      thai_alive_12_rows: [number, number];
      cid_multi_unit_13: number;
      cid_multi_amp_13: number;
      bad_birth_13: number;
      no_home_13: number;
      home_bad_village_13: number;
      sex_other_13: number;
      null_cid_13?: number;
      nation_13: [string, number][];
    };
  };
  bora: {
    offices: { rcode: string; name: string; amp: string }[];
    prov: SexArr;
    provAll: SexArr;
    provCentral: SexArr;
    provMoving: SexArr;
    office: Record<string, SexArr>;
    tambon: Record<string, SexArr & { name: string; amp: string }>;
    popMonth: { ym: number; m: number; f: number }[];
    vitalMonth: { ym: number; birth?: [number, number]; death?: [number, number]; movein?: [number, number]; moveout?: [number, number] }[];
    deathsFY: Record<string, SexArr>;
    midyearFY: Record<string, SexArr>;
  };
  bod: {
    satun: { year: number; age: number; sex: number; le: number; hale: number }[];
    thailand: { year: number; age: number; sex: number; le: number; hale: number }[];
  };
}

// ------------------------------------------------------------------ dimensions
export const AGE_BANDS = Array.from({ length: 21 }, (_, i) => (i === 20 ? "100+" : `${i * 5}–${i * 5 + 4}`));

export type TypeSet = "13" | "12" | "4";
export type Level = "prov" | "amp" | "unit";

export const TYPESET_LABEL: Record<TypeSet, string> = {
  "13": "TYPEAREA 1,3 (อาศัยอยู่จริงในเขต)",
  "12": "TYPEAREA 1,2 (มีชื่อตามทะเบียนบ้านในเขต)",
  "4": "TYPEAREA 4 (อาศัยนอกเขต — มารับบริการ)",
};
export const LEVEL_LABEL: Record<Level, string> = {
  prov: "ภาพจังหวัด — ตัดซ้ำ CID ทั้งจังหวัด",
  amp: "ภาพอำเภอ — HOSPCODE+PID → ตัดซ้ำ CID ภายในอำเภอ",
  unit: "ภาพรายหน่วยบริการ — HOSPCODE+PID (ไม่ตัดซ้ำข้ามหน่วย)",
};

export const AGE_PRESETS: { id: string; label: string; min: number; max: number }[] = [
  { id: "all", label: "ทุกอายุ", min: 0, max: 100 },
  { id: "0-5", label: "0–5 ปี", min: 0, max: 5 },
  { id: "6-14", label: "6–14 ปี", min: 6, max: 14 },
  { id: "15-59", label: "15–59 ปี", min: 15, max: 59 },
  { id: "60+", label: "60 ปีขึ้นไป", min: 60, max: 100 },
];

export interface Filters {
  amps: string[]; // [] = ทุกอำเภอ
  hostypes: string[]; // [] = ทุกประเภท
  hosps: string[]; // [] = ทุกหน่วย
  typeSet: TypeSet;
  sexes: (1 | 2)[]; // [] = ทั้งสองเพศ
  ageMin: number;
  ageMax: number;
}

export const DEFAULT_FILTERS: Filters = { amps: [], hostypes: [], hosps: [], typeSet: "13", sexes: [], ageMin: 0, ageMax: 100 };

/** ระดับการประมวลผลตามตัวกรอง: เลือกหน่วยบริการ/ประเภท → รายหน่วย, เลือกอำเภอ → อำเภอ, อื่น ๆ → จังหวัด */
export function levelOf(f: Filters): Level {
  if (f.hosps.length || f.hostypes.length) return "unit";
  if (f.amps.length) return "amp";
  return "prov";
}

const inSet = (t: number, s: TypeSet) => (s === "13" ? t === 1 || t === 3 : s === "12" ? t === 1 || t === 2 : t === 4);
const MEASURE: Record<TypeSet, { amp: number; prov: number }> = { "13": { amp: 5, prov: 6 }, "12": { amp: 7, prov: 8 }, "4": { amp: 9, prov: 10 } };
function measureIx(level: Level, s: TypeSet) {
  if (level === "unit") return 4;
  return MEASURE[s][level];
}

function hospOk(d: PopulationData, f: Filters, hi: number) {
  const h = d.hdc.hosp[hi];
  if (f.amps.length && !f.amps.includes(h.amp)) return false;
  if (f.hostypes.length && !f.hostypes.includes(h.type)) return false;
  if (f.hosps.length && !f.hosps.includes(h.code)) return false;
  return true;
}
const sexOk = (f: Filters, s: number) => !f.sexes.length || f.sexes.includes(s as 1 | 2);
const ageOk = (f: Filters, g: number) => g >= f.ageMin && g <= f.ageMax;

// ------------------------------------------------------------------ HDC aggregations
export interface HdcSummary {
  level: Level;
  total: number;
  male: number;
  female: number;
  unknownAge: number;
  pyramid: { band: string; m: number; f: number }[];
  single: { "1": number[]; "2": number[] };
}

export function hdcSummary(d: PopulationData, f: Filters, levelOverride?: Level): HdcSummary {
  const level = levelOverride ?? levelOf(f);
  const mi = measureIx(level, f.typeSet);
  const single = { "1": Array(101).fill(0), "2": Array(101).fill(0) };
  let total = 0, male = 0, female = 0, unknownAge = 0;
  for (const r of d.hdc.cube) {
    if (!inSet(r[1], f.typeSet) || !hospOk(d, f, r[0]) || !sexOk(f, r[2])) continue;
    const v = r[mi];
    if (!v) continue;
    if (r[3] < 0) {
      if (f.ageMin === 0 && f.ageMax === 100) { unknownAge += v; total += v; if (r[2] === 1) male += v; else if (r[2] === 2) female += v; }
      continue;
    }
    if (!ageOk(f, r[3])) continue;
    total += v;
    if (r[2] === 1) { male += v; single["1"][r[3]] += v; }
    else if (r[2] === 2) { female += v; single["2"][r[3]] += v; }
  }
  return { level, total, male, female, unknownAge, single, pyramid: toPyramid(single) };
}

export function toPyramid(single: { "1": number[]; "2": number[] }) {
  return AGE_BANDS.map((band, i) => {
    let m = 0, fe = 0;
    for (let a = i * 5; a < (i === 20 ? 101 : i * 5 + 5); a++) { m += single["1"][a] ?? 0; fe += single["2"][a] ?? 0; }
    return { band, m, f: fe };
  });
}

/** ตาราง: แยกอำเภอ (ใช้ตัววัดอำเภอ a13/a12) */
export function hdcByAmp(d: PopulationData, f: Filters) {
  const mi = measureIx("amp", f.typeSet);
  const out = new Map<string, { m: number; f: number }>();
  for (const r of d.hdc.cube) {
    if (!inSet(r[1], f.typeSet) || !hospOk(d, f, r[0]) || !sexOk(f, r[2]) || (r[3] >= 0 && !ageOk(f, r[3]))) continue;
    if (r[3] < 0 && !(f.ageMin === 0 && f.ageMax === 100)) continue;
    const amp = d.hdc.hosp[r[0]].amp;
    const cur = out.get(amp) ?? { m: 0, f: 0 };
    if (r[2] === 1) cur.m += r[mi]; else if (r[2] === 2) cur.f += r[mi];
    out.set(amp, cur);
  }
  return d.hdc.amp.map((a) => ({ code: a.code, name: a.name, ...(out.get(a.code) ?? { m: 0, f: 0 }) }));
}

/** ตาราง: รายหน่วยบริการ (ตัววัด u = HOSPCODE+PID) */
export function hdcByHosp(d: PopulationData, f: Filters) {
  const acc = d.hdc.hosp.map(() => ({ m: 0, f: 0, t1: 0, t2: 0, t3: 0, t4: 0, old: 0 }));
  for (const r of d.hdc.cube) {
    if (!hospOk(d, f, r[0]) || !sexOk(f, r[2])) continue;
    if (r[3] >= 0 ? !ageOk(f, r[3]) : !(f.ageMin === 0 && f.ageMax === 100)) continue;
    const a = acc[r[0]];
    if (r[1] === 1) a.t1 += r[4]; else if (r[1] === 2) a.t2 += r[4]; else if (r[1] === 3) a.t3 += r[4]; else if (r[1] === 4) a.t4 += r[4];
    if (!inSet(r[1], f.typeSet)) continue;
    if (r[2] === 1) a.m += r[4]; else if (r[2] === 2) a.f += r[4];
    if (r[3] >= 60) a.old += r[4];
  }
  return d.hdc.hosp
    .map((h, i) => ({ ...h, ...acc[i], total: acc[i].m + acc[i].f }))
    .filter((r, i) => hospOk(d, f, i) && r.t1 + r.t2 + r.t3 + r.t4 > 0);
}

/**
 * องค์ประกอบ TYPEAREA 1–4 ตามตัวกรองพื้นที่/หน่วย/เพศ/อายุ
 * rows = HOSPCODE+PID ต่อ TYPEAREA; cid13/cid12/cid4 = ตัดซ้ำ CID ตามระดับ (จังหวัด/อำเภอ/หน่วย)
 * only4 = CID ที่เป็น TYPEAREA 4 และไม่มี TYPEAREA 1,2,3 ที่หน่วยใดในจังหวัด (มีเฉพาะภาพจังหวัด)
 */
export function hdcTypeMix(d: PopulationData, f: Filters) {
  const level = levelOf(f);
  const rows = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<1 | 2 | 3 | 4, number>;
  let cid13 = 0, cid12 = 0, cid4 = 0, only4 = 0;
  const allAges = f.ageMin === 0 && f.ageMax === 100;
  for (const r of d.hdc.cube) {
    if (!hospOk(d, f, r[0]) || !sexOk(f, r[2])) continue;
    if (r[3] >= 0 ? !ageOk(f, r[3]) : !allAges) continue;
    rows[r[1] as 1 | 2 | 3 | 4] += r[4];
    cid13 += r[measureIx(level, "13")];
    cid12 += r[measureIx(level, "12")];
    cid4 += r[measureIx(level, "4")];
    only4 += r[11];
  }
  return { level, rows, cid13, cid12, cid4, only4: level === "prov" ? only4 : null };
}

/** TYPEAREA 4 รายอำเภอ: a4 (ตัดซ้ำ CID ในอำเภอ) */
export function hdcType4ByAmp(d: PopulationData, f: Filters) {
  const out = new Map<string, { rows: number; cid: number; m: number; f: number }>();
  const allAges = f.ageMin === 0 && f.ageMax === 100;
  for (const r of d.hdc.cube) {
    if (r[1] !== 4 || !hospOk(d, f, r[0]) || !sexOk(f, r[2])) continue;
    if (r[3] >= 0 ? !ageOk(f, r[3]) : !allAges) continue;
    const amp = d.hdc.hosp[r[0]].amp;
    const c = out.get(amp) ?? { rows: 0, cid: 0, m: 0, f: 0 };
    c.rows += r[4]; c.cid += r[9];
    if (r[2] === 1) c.m += r[9]; else if (r[2] === 2) c.f += r[9];
    out.set(amp, c);
  }
  return d.hdc.amp.filter((a) => out.has(a.code)).map((a) => ({ code: a.code, name: a.name, ...out.get(a.code)! }));
}

/** คุณลักษณะ (ศาสนา/หมู่เลือด/…): จังหวัด = p13, เมื่อกรองอำเภอ = a13 (ไม่รองรับตัวกรองหน่วยบริการ/อายุ) */
export function hdcAttr(d: PopulationData, f: Filters, key: string) {
  const useAmp = f.amps.length > 0;
  const out = new Map<string, number>();
  for (const r of d.hdc.attr) {
    if (r[1] !== key || !sexOk(f, r[3])) continue;
    if (useAmp && !f.amps.includes(r[0])) continue;
    out.set(r[2], (out.get(r[2]) ?? 0) + (useAmp ? r[4] : r[5]));
  }
  const labels = d.hdc.attrLabels[key] ?? {};
  return [...out.entries()]
    .map(([code, n]) => ({ code, label: code === "" ? "ไม่บันทึก" : labels[code] ?? `รหัส ${code} (ไม่อยู่ในรหัสมาตรฐาน)`, n }))
    .sort((a, b) => b.n - a.n);
}

/** ตำบล/หมู่บ้าน ตามที่อยู่ในแฟ้ม home (TYPEAREA 1,3) */
export function hdcByTambon(d: PopulationData, f: Filters) {
  const out = new Map<string, { m: number; f: number; vil: Map<string, number> }>();
  const bandMin = Math.floor(f.ageMin / 5), bandMax = Math.floor(f.ageMax / 5);
  const allAge = f.ageMin === 0 && f.ageMax === 100;
  for (const r of d.hdc.village) {
    const tmb = r[0].slice(0, 6);
    if (f.amps.length && !f.amps.includes(tmb.slice(2, 4))) continue;
    if (!sexOk(f, r[1])) continue;
    if (r[2] < 0 ? !allAge : r[2] < bandMin || r[2] > bandMax) continue;
    const cur = out.get(tmb) ?? { m: 0, f: 0, vil: new Map() };
    if (r[1] === 1) cur.m += r[4]; else if (r[1] === 2) cur.f += r[4];
    cur.vil.set(r[0], (cur.vil.get(r[0]) ?? 0) + r[3]);
    out.set(tmb, cur);
  }
  return [...out.entries()]
    .map(([code, v]) => ({
      code, name: d.hdc.tmb[code] ?? code, amp: code.slice(2, 4), m: v.m, f: v.f,
      villages: [...v.vil.entries()].map(([vc, n]) => ({ code: vc, name: d.hdc.vil[vc] ?? vc, moo: Number(vc.slice(6)), n })).sort((a, b) => a.moo - b.moo),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

// ------------------------------------------------------------------ BORA aggregations
function sumSexArr(list: SexArr[]): SexArr {
  const o = { "1": Array(101).fill(0), "2": Array(101).fill(0) };
  for (const s of list) for (const k of ["1", "2"] as const) s[k].forEach((v, i) => (o[k][i] += v));
  return o;
}

export function boraSingle(d: PopulationData, f: Pick<Filters, "amps">): SexArr {
  if (!f.amps.length) return d.bora.prov;
  return sumSexArr(d.bora.offices.filter((o) => f.amps.includes(o.amp)).map((o) => d.bora.office[o.rcode]));
}

export function boraSummary(d: PopulationData, f: Filters) {
  const single = boraSingle(d, f);
  const pick = (k: "1" | "2") => (f.sexes.length && !f.sexes.includes(Number(k) as 1 | 2) ? 0 : 1);
  const s = { "1": single["1"].map((v, i) => (ageOk(f, i) ? v * pick("1") : 0)), "2": single["2"].map((v, i) => (ageOk(f, i) ? v * pick("2") : 0)) };
  const male = s["1"].reduce((a, b) => a + b, 0), female = s["2"].reduce((a, b) => a + b, 0);
  return { total: male + female, male, female, single: s, pyramid: toPyramid(s) };
}

export function boraByAmp(d: PopulationData) {
  return d.hdc.amp.map((a) => {
    const s = sumSexArr(d.bora.offices.filter((o) => o.amp === a.code).map((o) => d.bora.office[o.rcode]));
    return { code: a.code, name: a.name, m: s["1"].reduce((x, y) => x + y, 0), f: s["2"].reduce((x, y) => x + y, 0), single: s };
  });
}

// ------------------------------------------------------------------ demographic indices
export function indices(single: { "1": number[]; "2": number[] }) {
  const tot = (a: number, b: number) => {
    let s = 0;
    for (let i = a; i <= b; i++) s += (single["1"][i] ?? 0) + (single["2"][i] ?? 0);
    return s;
  };
  const all = tot(0, 100), kids = tot(0, 14), work = tot(15, 59), old = tot(60, 100), old65 = tot(65, 100);
  const m = single["1"].reduce((a, b) => a + b, 0), f = single["2"].reduce((a, b) => a + b, 0);
  // อายุมัธยฐาน (อายุเต็มปีที่ผลสะสมถึงครึ่งหนึ่ง)
  let cum = 0, median = 0;
  for (let i = 0; i <= 100; i++) { cum += (single["1"][i] ?? 0) + (single["2"][i] ?? 0); if (cum >= all / 2) { median = i; break; } }
  return {
    all, kids, work, old, old65, median,
    sexRatio: f ? (m / f) * 100 : 0,
    oldShare: all ? (old / all) * 100 : 0,
    agingIndex: kids ? (old / kids) * 100 : 0,
    dependency: work ? ((kids + old) / work) * 100 : 0,
    oldDependency: work ? (old / work) * 100 : 0,
  };
}

/** กลุ่มเป้าหมายงานส่งเสริมป้องกัน — นิยามช่วงอายุ (เพศ) */
export const TARGET_GROUPS: { id: string; label: string; min: number; max: number; sex?: 1 | 2 }[] = [
  { id: "0-5", label: "เด็ก 0–5 ปี", min: 0, max: 5 },
  { id: "6-14", label: "เด็กวัยเรียน 6–14 ปี", min: 6, max: 14 },
  { id: "f15-49", label: "หญิงวัยเจริญพันธุ์ 15–49 ปี", min: 15, max: 49, sex: 2 },
  { id: "f30-60", label: "หญิง 30–60 ปี (คัดกรองมะเร็งปากมดลูก)", min: 30, max: 60, sex: 2 },
  { id: "35+", label: "ประชากร 35 ปีขึ้นไป (คัดกรอง DM/HT)", min: 35, max: 100 },
  { id: "60+", label: "ผู้สูงอายุ 60 ปีขึ้นไป", min: 60, max: 100 },
];

export function targetCount(single: { "1": number[]; "2": number[] }, g: (typeof TARGET_GROUPS)[number]) {
  let s = 0;
  for (let a = g.min; a <= g.max; a++) {
    if (g.sex !== 2) s += single["1"][a] ?? 0;
    if (g.sex !== 1) s += single["2"][a] ?? 0;
  }
  return s;
}

// ------------------------------------------------------------------ LE / HALE
export interface LeResult {
  sex: 1 | 2 | 3;
  fys: string[];
  lt: LifeTable;
  hale: HaleResult;
  ref: { year: number; le0: number; hale0: number; le60: number; hale60: number };
}

function bodRef(d: PopulationData, sex: number) {
  const years = d.bod.satun.map((r) => r.year);
  const year = Math.max(...years);
  const get = (age: number) => d.bod.satun.find((r) => r.year === year && r.age === age && r.sex === sex)!;
  return { year, le0: get(0).le, hale0: get(0).hale, le60: get(60).le, hale60: get(60).hale };
}

/** LE/HALE จากข้อมูลตาย + ประชากรกลางปีของทะเบียนราษฎร รวมหลายปีงบ (pooled) */
export function computeLe(d: PopulationData, fys: string[], sex: 1 | 2 | 3): LeResult {
  const sexes = sex === 3 ? (["1", "2"] as const) : ([String(sex)] as ("1" | "2")[]);
  const D = Array(LT_GROUPS.length).fill(0), P = Array(LT_GROUPS.length).fill(0);
  for (const fy of fys) for (const s of sexes) {
    groupSingleAges(d.bora.deathsFY[fy][s]).forEach((v, i) => (D[i] += v));
    groupSingleAges(d.bora.midyearFY[fy][s]).forEach((v, i) => (P[i] += v));
  }
  const lt = lifeTable(D, P, sex);
  const ref = bodRef(d, sex);
  return { sex, fys, lt, hale: sullivanHale(lt, ref), ref };
}

export const fyList = (d: PopulationData) => Object.keys(d.bora.deathsFY).sort();
export const ymLabel = (ym: number) => {
  const y = Math.floor(ym / 100), m = ym % 100;
  const TH = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${TH[m]} ${y}`;
};
