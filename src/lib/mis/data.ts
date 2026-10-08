import raw from "@/data/mis/health.json";

export type Year = 2566 | 2567 | 2568 | 2569;
export type Setting = "opd" | "ipd";
export type Category = "ncd" | "communicable";

export interface SexRow { name: string; male: number; female: number; total: number }
export interface TopRow { rank: number; name: string; people: number; visits: number }
export interface YearRange { start: Year; end: Year }

type ByYear<T> = Record<string, T[]>;
interface HealthData {
  meta: {
    province: string;
    source: string;
    hdcProcessedDate: string;
    extractedDate: string;
    filters: string;
    years: number[];
  };
  top10: Record<Setting, ByYear<TopRow>>;
  ncd: Record<Setting, ByYear<SexRow>>;
  communicable: Record<Setting, ByYear<SexRow>>;
}

const data = raw as HealthData;

export const META = data.meta;
export const YEARS = data.meta.years as Year[];
export const FIRST_YEAR = YEARS[0];
export const LAST_YEAR = YEARS[YEARS.length - 1];

export const SETTING_LABEL: Record<Setting, string> = { opd: "ผู้ป่วยนอก", ipd: "ผู้ป่วยใน" };
export const CATEGORY_LABEL: Record<Category, string> = { ncd: "โรคไม่ติดต่อ (NCD)", communicable: "โรคติดต่อ" };

export function yearsInRange({ start, end }: YearRange): Year[] {
  return YEARS.filter((y) => y >= start && y <= end);
}

export function rows(category: Category, setting: Setting, year: Year): SexRow[] {
  return data[category][setting][String(year)] ?? [];
}

export function top10(setting: Setting, year: Year): TopRow[] {
  return data.top10[setting][String(year)] ?? [];
}

export function sumTotal(list: SexRow[]) {
  return list.reduce(
    (acc, r) => ({ male: acc.male + r.male, female: acc.female + r.female, total: acc.total + r.total }),
    { male: 0, female: 0, total: 0 },
  );
}

/** Year-over-year percent change; null when no previous year exists or base is 0. */
export function pctChange(curr: number, prev: number | undefined): number | null {
  if (prev === undefined || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export interface KpiDef {
  id: string;
  label: string;
  hint: string;
  category: Category;
  setting: Setting;
}

export const KPI_DEFS: KpiDef[] = [
  { id: "ncd-opd", label: "บริการ NCD ผู้ป่วยนอก", hint: "8 กลุ่มโรค NCD · ครั้ง", category: "ncd", setting: "opd" },
  { id: "ncd-ipd", label: "ผู้ป่วยใน NCD", hint: "8 กลุ่มโรค NCD · ครั้ง", category: "ncd", setting: "ipd" },
  { id: "com-opd", label: "โรคติดต่อ ผู้ป่วยนอก", hint: "ICD-10 A00–B99 · ครั้ง", category: "communicable", setting: "opd" },
  { id: "com-ipd", label: "โรคติดต่อ ผู้ป่วยใน", hint: "ICD-10 A00–B99 · ครั้ง", category: "communicable", setting: "ipd" },
];

export function kpiSeries(def: KpiDef, range: YearRange) {
  return yearsInRange(range).map((y) => ({ year: y, value: sumTotal(rows(def.category, def.setting, y)).total }));
}

export function kpiValue(def: KpiDef, year: Year) {
  const curr = sumTotal(rows(def.category, def.setting, year)).total;
  const prevYear = (year - 1) as Year;
  const prev = YEARS.includes(prevYear) ? sumTotal(rows(def.category, def.setting, prevYear)).total : undefined;
  return { value: curr, change: pctChange(curr, prev), prevYear: prev === undefined ? null : prevYear };
}

/** Trend matrix: one point per year, one key per disease name (top N by total across range). */
export function trendSeries(category: Category, setting: Setting, range: YearRange, limit = 5) {
  const ys = yearsInRange(range);
  const totals = new Map<string, number>();
  for (const y of ys) for (const r of rows(category, setting, y)) totals.set(r.name, (totals.get(r.name) ?? 0) + r.total);
  const names = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n);
  const points = ys.map((y) => {
    const point: Record<string, number | string> = { year: String(y) };
    for (const n of names) point[n] = rows(category, setting, y).find((r) => r.name === n)?.total ?? 0;
    return point;
  });
  return { names, points };
}

export interface TableRow extends SexRow {
  key: string;
  category: Category;
  setting: Setting;
  prevTotal: number | null;
  change: number | null;
}

export function tableRows(year: Year): TableRow[] {
  const out: TableRow[] = [];
  const prevYear = (year - 1) as Year;
  const hasPrev = YEARS.includes(prevYear);
  for (const category of ["ncd", "communicable"] as Category[]) {
    for (const setting of ["opd", "ipd"] as Setting[]) {
      const prevList = hasPrev ? rows(category, setting, prevYear) : [];
      for (const r of rows(category, setting, year)) {
        const prev = hasPrev ? prevList.find((p) => p.name === r.name)?.total ?? 0 : null;
        out.push({
          ...r,
          key: `${category}:${setting}:${r.name}`,
          category,
          setting,
          prevTotal: prev,
          change: prev === null ? null : pctChange(r.total, prev),
        });
      }
    }
  }
  return out;
}

export function allDiseaseNames(): { name: string; category: Category }[] {
  const seen = new Map<string, Category>();
  for (const category of ["ncd", "communicable"] as Category[])
    for (const setting of ["opd", "ipd"] as Setting[])
      for (const y of YEARS) for (const r of rows(category, setting, y)) if (!seen.has(r.name)) seen.set(r.name, category);
  return [...seen.entries()].map(([name, category]) => ({ name, category }));
}
