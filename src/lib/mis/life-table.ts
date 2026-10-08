/**
 * ตารางชีพย่อ (Abridged life table) แบบ Chiang II + อายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) แบบ Sullivan
 *
 * ไม่มี import ใด ๆ — ทดสอบได้ตรงด้วย `node --test tests/life-table.test.mjs`
 *
 * อ้างอิงวิธีคิด:
 *  - Chiang CL. The Life Table and Its Applications (1984) — ตารางชีพย่อและความแปรปรวนของ ex
 *  - Preston, Heuveline & Guillot. Demography (2001) ตาราง 3.3 — ค่า a0, a1-4 แบบ Coale-Demeny
 *  - Sullivan DF. A single index of mortality and morbidity. HSMHA Health Rep 1971 — HALE
 *  - Silcocks PBS et al. (2001) — ความแปรปรวนของช่วงอายุเปิด (open-ended interval)
 */

/** กลุ่มอายุของตารางชีพย่อ: 0, 1–4, 5–9, …, 80–84, 85+ */
export const LT_GROUPS: { start: number; n: number; label: string }[] = [
  { start: 0, n: 1, label: "0" },
  { start: 1, n: 4, label: "1–4" },
  ...Array.from({ length: 16 }, (_, i) => ({ start: 5 + i * 5, n: 5, label: `${5 + i * 5}–${9 + i * 5}` })),
  { start: 85, n: Infinity, label: "85+" },
];

export type LtSex = 1 | 2 | 3; // 1 ชาย, 2 หญิง, 3 รวม

export interface LifeTableRow {
  label: string;
  start: number;
  n: number;
  deaths: number;
  personYears: number;
  mx: number;
  ax: number;
  qx: number;
  lx: number;
  dx: number;
  Lx: number;
  Tx: number;
  ex: number;
  varEx: number;
}

export interface LifeTable {
  rows: LifeTableRow[];
  e0: number;
  e60: number;
  ci0: [number, number];
  ci60: [number, number];
  deaths: number;
  personYears: number;
}

/** รวมจำนวนรายอายุเดี่ยว (index = อายุ, ตัวสุดท้าย = อายุสุดท้ายขึ้นไป) เป็นกลุ่มอายุของตารางชีพ */
export function groupSingleAges(single: number[]): number[] {
  return LT_GROUPS.map((g) => {
    let s = 0;
    const end = g.n === Infinity ? single.length : g.start + g.n;
    for (let a = g.start; a < Math.min(end, single.length); a++) s += single[a] ?? 0;
    return s;
  });
}

/** a0 และ a1-4 แบบ Coale-Demeny (Preston 2001 ตาราง 3.3) ตามเพศและ m0; เพศรวมใช้ค่าเฉลี่ยชาย/หญิง */
export function infantAx(m0: number, sex: LtSex): { a0: number; a1: number } {
  const male = m0 >= 0.107 ? { a0: 0.33, a1: 1.352 } : { a0: 0.045 + 2.684 * m0, a1: 1.651 - 2.816 * m0 };
  const female = m0 >= 0.107 ? { a0: 0.35, a1: 1.361 } : { a0: 0.053 + 2.8 * m0, a1: 1.522 - 1.518 * m0 };
  if (sex === 1) return male;
  if (sex === 2) return female;
  return { a0: (male.a0 + female.a0) / 2, a1: (male.a1 + female.a1) / 2 };
}

/**
 * สร้างตารางชีพย่อ
 * @param deaths      จำนวนตายรายกลุ่มอายุ (ตาม LT_GROUPS) รวมทุกปีที่นำมาคำนวณ
 * @param personYears ประชากรกลางปีรายกลุ่มอายุ รวมทุกปีที่นำมาคำนวณ (= person-years)
 */
export function lifeTable(deaths: number[], personYears: number[], sex: LtSex, radix = 100000): LifeTable {
  const k = LT_GROUPS.length;
  if (deaths.length !== k || personYears.length !== k) throw new Error(`ต้องมี ${k} กลุ่มอายุ`);
  const mx = deaths.map((d, i) => (personYears[i] > 0 ? d / personYears[i] : 0));
  const { a0, a1 } = infantAx(mx[0], sex);

  const rows: LifeTableRow[] = [];
  let lx = radix;
  for (let i = 0; i < k; i++) {
    const g = LT_GROUPS[i];
    const open = g.n === Infinity;
    const ax = i === 0 ? a0 : i === 1 ? a1 : open ? (mx[i] > 0 ? 1 / mx[i] : 0) : g.n / 2;
    const qx = open ? 1 : Math.min(1, (g.n * mx[i]) / (1 + (g.n - ax) * mx[i]));
    const dx = lx * qx;
    const Lx = open ? (mx[i] > 0 ? lx / mx[i] : 0) : g.n * (lx - dx) + ax * dx;
    rows.push({
      label: g.label, start: g.start, n: g.n, deaths: deaths[i], personYears: personYears[i],
      mx: mx[i], ax, qx, lx, dx, Lx, Tx: 0, ex: 0, varEx: 0,
    });
    lx -= dx;
  }
  let T = 0;
  for (let i = k - 1; i >= 0; i--) {
    T += rows[i].Lx;
    rows[i].Tx = T;
    rows[i].ex = rows[i].lx > 0 ? T / rows[i].lx : 0;
  }

  // ความแปรปรวนของ ex (Chiang) + ช่วงอายุเปิด (Silcocks)
  const varQ = rows.map((r) => {
    if (r.n === Infinity || r.personYears <= 0) return 0;
    const n = r.n;
    return (n * n * r.mx * (1 - r.ax * r.mx)) / (r.personYears * Math.pow(1 + (n - r.ax) * r.mx, 3));
  });
  const last = rows[k - 1];
  const openTerm =
    last.mx > 0 && last.personYears > 0
      ? (Math.pow(last.lx, 2) / Math.pow(last.mx, 4)) * (last.deaths / Math.pow(last.personYears, 2))
      : 0;
  for (let x = 0; x < k; x++) {
    let s = openTerm;
    for (let i = x; i < k - 1; i++) {
      const r = rows[i];
      const f = r.ax / r.n;
      s += Math.pow(r.lx, 2) * Math.pow((1 - f) * r.n + rows[i + 1].ex, 2) * varQ[i];
    }
    rows[x].varEx = rows[x].lx > 0 ? s / Math.pow(rows[x].lx, 2) : 0;
  }

  const i60 = LT_GROUPS.findIndex((g) => g.start === 60);
  const ci = (r: LifeTableRow): [number, number] => {
    const h = 1.96 * Math.sqrt(r.varEx);
    return [r.ex - h, r.ex + h];
  };
  return {
    rows,
    e0: rows[0].ex,
    e60: rows[i60].ex,
    ci0: ci(rows[0]),
    ci60: ci(rows[i60]),
    deaths: deaths.reduce((a, b) => a + b, 0),
    personYears: personYears.reduce((a, b) => a + b, 0),
  };
}

export interface HaleResult {
  hale0: number;
  hale60: number;
  /** สัดส่วนปีที่อยู่กับภาวะพร่องสุขภาพ (1 − health weight) ที่ใช้: อายุ < 60 และ ≥ 60 */
  piYoung: number;
  piOld: number;
}

/**
 * HALE แบบ Sullivan: HALE_x = Σ_{i≥x} L_i·(1 − π_i) / l_x
 *
 * ข้อมูลความชุกภาวะพร่องสุขภาพ (π) รายอายุไม่มีใน HDC/ทะเบียนราษฎร จึง "สอบเทียบ" π 2 ช่วงอายุ (<60, ≥60)
 * จากค่าอ้างอิงทางการของ BOD (HALE/LE ที่แรกเกิดและที่อายุ 60 ของจังหวัด/เพศเดียวกัน) แล้วนำไปใช้กับ
 * ตารางชีพที่คำนวณเองจากข้อมูลตาย/ประชากรล่าสุด:
 *   π_old   = 1 − HALE60_ref / LE60_ref
 *   π_young = 1 − (r0·e0·l0 − T60·(1−π_old)) / (T0 − T60),  r0 = HALE0_ref / LE0_ref
 */
export function sullivanHale(
  lt: LifeTable,
  ref: { le0: number; hale0: number; le60: number; hale60: number },
): HaleResult {
  const rows = lt.rows;
  const i60 = rows.findIndex((r) => r.start === 60);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const piOld = clamp(1 - ref.hale60 / ref.le60);
  const r0 = ref.hale0 / ref.le0;
  const T0 = rows[0].Tx;
  const T60 = rows[i60].Tx;
  const piYoung = clamp(1 - (r0 * lt.e0 * rows[0].lx - T60 * (1 - piOld)) / (T0 - T60));
  const healthy = (from: number) => {
    let s = 0;
    for (let i = from; i < rows.length; i++) s += rows[i].Lx * (1 - (i < i60 ? piYoung : piOld));
    return s / rows[from].lx;
  };
  return { hale0: healthy(0), hale60: healthy(i60), piYoung, piOld };
}
