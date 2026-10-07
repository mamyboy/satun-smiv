/**
 * ประวัติการประมวลผลตัวชี้วัด (snapshot ต่อรอบประมวลผล HDC) + สรุปรายสัปดาห์
 * ไฟล์นี้เป็น pure function — ใช้ได้ทั้งฝั่ง Next.js และ node:test (tests/indicator-history.test.mjs)
 */

export type HistorySnapshot = {
  /** วันที่ HDC ประมวลผล (ISO yyyy-mm-dd, ค.ศ.) */
  processedDateISO: string;
  /** วันที่ประมวลผลตามที่ HDC แสดง เช่น "06 ตุลาคม 2569" */
  processedDate: string;
  /** เวลาที่สคริปต์ดึงข้อมูล (UTC ISO) */
  extractedAt: string;
  values: number[];
};

export type HistoryFile = {
  key: string;
  reportCode: string;
  snapshots: HistorySnapshot[];
};

export type WeeklyPoint = {
  /** วันจันทร์ของสัปดาห์ (ISO) */
  weekStart: string;
  /** วันอาทิตย์ของสัปดาห์ (ISO) */
  weekEnd: string;
  /** snapshot ล่าสุดของสัปดาห์ (ใช้เป็นค่าตัวแทนสัปดาห์) */
  snapshot: HistorySnapshot;
  /** จำนวนรอบประมวลผลในสัปดาห์นั้น */
  runs: number;
  /** ส่วนต่างเทียบสัปดาห์ก่อน (null = สัปดาห์แรก) */
  delta: (number | null)[] | null;
};

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "06 ตุลาคม 2569" -> "2026-10-06" (คืน null ถ้าแปลงไม่ได้) */
export function parseThaiDate(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return null;
  const month = THAI_MONTHS.indexOf(m[2]);
  if (month < 0) return null;
  const year = Number(m[3]) - 543;
  const day = Number(m[1]);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoToUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function utcDateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** วันจันทร์ของสัปดาห์ที่ iso อยู่ */
export function weekStartOf(iso: string): string {
  const d = isoToUtcDate(iso);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Monday
  d.setUTCDate(d.getUTCDate() - dow);
  return utcDateToIso(d);
}

export function addDays(iso: string, days: number): string {
  const d = isoToUtcDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateToIso(d);
}

/** "2026-10-06" -> "6 ต.ค. 69" */
export function formatThaiShort(iso: string, withYear = true): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]}${withYear ? ` ${String(y + 543).slice(-2)}` : ""}`;
}

export function formatWeekRange(weekStart: string, weekEnd: string): string {
  return `${formatThaiShort(weekStart, false)} – ${formatThaiShort(weekEnd)}`;
}

/**
 * เพิ่ม snapshot ใหม่ลงประวัติ — 1 วันประมวลผล HDC = 1 รายการ
 * (ถ้าวันประมวลผลซ้ำ ให้ค่าที่ดึงล่าสุดทับของเดิม) แล้วเรียงตามวันที่
 */
export function mergeSnapshot(snapshots: HistorySnapshot[], incoming: HistorySnapshot): HistorySnapshot[] {
  const map = new Map(snapshots.map((s) => [s.processedDateISO, s]));
  const existing = map.get(incoming.processedDateISO);
  if (!existing || existing.extractedAt <= incoming.extractedAt) {
    map.set(incoming.processedDateISO, incoming);
  }
  return [...map.values()].sort((a, b) => a.processedDateISO.localeCompare(b.processedDateISO));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function diffValues(current: number[], previous: number[]): (number | null)[] {
  return current.map((v, i) =>
    typeof v === "number" && typeof previous[i] === "number" ? round2(v - previous[i]) : null,
  );
}

/** สรุปรายสัปดาห์ (จันทร์–อาทิตย์) ใช้ snapshot ล่าสุดของแต่ละสัปดาห์เป็นตัวแทน */
export function aggregateWeekly(snapshots: HistorySnapshot[]): WeeklyPoint[] {
  const sorted = [...snapshots].sort((a, b) => a.processedDateISO.localeCompare(b.processedDateISO));
  const weeks = new Map<string, { snapshot: HistorySnapshot; runs: number }>();
  for (const s of sorted) {
    const wk = weekStartOf(s.processedDateISO);
    const prev = weeks.get(wk);
    weeks.set(wk, { snapshot: s, runs: (prev?.runs ?? 0) + 1 });
  }
  const points: WeeklyPoint[] = [];
  for (const [weekStart, { snapshot, runs }] of [...weeks.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const prev = points[points.length - 1];
    points.push({
      weekStart,
      weekEnd: addDays(weekStart, 6),
      snapshot,
      runs,
      delta: prev ? diffValues(snapshot.values, prev.snapshot.values) : null,
    });
  }
  return points;
}

/** รายครั้งที่ประมวลผล พร้อมส่วนต่างเทียบครั้งก่อนหน้า */
export function withRunDeltas(snapshots: HistorySnapshot[]) {
  const sorted = [...snapshots].sort((a, b) => a.processedDateISO.localeCompare(b.processedDateISO));
  return sorted.map((s, i) => ({
    snapshot: s,
    delta: i > 0 ? diffValues(s.values, sorted[i - 1].values) : null,
  }));
}
