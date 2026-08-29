import indicator1Raw from "../../amphoe-data/indicator1/data.json";
import indicator2Raw from "../../amphoe-data/indicator2/data.json";
import indicator3Raw from "../../amphoe-data/indicator3/data.json";
import indicator4Raw from "../../amphoe-data/indicator4/data.json";
import indicator5Raw from "../../amphoe-data/indicator5/data.json";
import indicatorsConfig from "../../scripts/indicators.config.js";

export type DiagnosisRow = {
  code: string;
  name: string;
  total: number;
  f00_09: number;
  f10_19: number;
  f20_29: number;
  f30_39: number;
  f40_48: number;
  f50_59: number;
  f60_69: number;
  f70_79: number;
  f80_89: number;
  f90_98: number;
  other: number;
  x60_84: number;
};

/** เซลล์หัวตาราง ตรงกับ colspan/rowspan จริงบนหน้า HDC */
export type HdcHeaderCell = { text: string; colSpan: number; rowSpan: number };

type AmphoeEntry = {
  diagnoses: DiagnosisRow[];
  summary?: DiagnosisRow;
  headerRows?: HdcHeaderCell[][];
  extractedAt: string;
  processedDate?: string;
  error?: string;
};

const indicator1 = indicator1Raw as Record<string, AmphoeEntry>;

type Indicator2Row = { area: string; values: number[]; raw: string[] };
type Indicator2Data = {
  reportCode: string;
  name: string;
  headerRows: HdcHeaderCell[][];
  columns: string[];
  dataRows: Indicator2Row[];
  extractedAt: string;
  processedDate?: string;
};

const indicator2 = indicator2Raw as Indicator2Data;

/** ตัวชี้วัด 3 — โครงสร้างใหม่: มุมมอง "รายหน่วยบริการ" แยกตามอำเภอ (byAmphoe) */
type Indicator3FacilityEntry = {
  headerRows?: HdcHeaderCell[][];
  columns?: string[];
  dataRows?: Indicator2Row[];
  extractedAt?: string;
  processedDate?: string;
  error?: string;
};
type Indicator3Data = {
  reportCode: string;
  name: string;
  viewMode: string;
  byAmphoe: Record<string, Indicator3FacilityEntry>;
};

const indicator3 = indicator3Raw as Indicator3Data;
const indicator4 = indicator4Raw as Indicator2Data;
const indicator5 = indicator5Raw as Indicator3Data;

/** ตัวชี้วัด 1 — จำนวนผู้ป่วย SMI-V แยกตามอำเภอ */
export const amphoeList = Object.keys(indicator1);

export const amphoeStats = amphoeList
  .filter((name) => !indicator1[name].error)
  .map((name) => ({
    amphoe: name,
    total: indicator1[name].summary?.total ?? 0,
  }))
  .sort((a, b) => b.total - a.total);

export const provinceTotal = amphoeStats.reduce((sum, item) => sum + item.total, 0);

export const extractedAt = amphoeList
  .map((name) => indicator1[name].extractedAt)
  .filter(Boolean)
  .sort()
  .at(-1);

/** วันที่ประมวลผลจริงบนหน้า HDC (แสดงใต้ตาราง) — เลือกค่าล่าสุดจากทุกอำเภอ */
export const indicator1ProcessedDate = amphoeList
  .map((name) => indicator1[name].processedDate)
  .filter(Boolean)
  .sort()
  .at(-1);

/** รวมยอดแยกตามรหัสวินิจฉัย (1B030-1B033) ทุกอำเภอ */
const diagnosisCodeNames: Record<string, string> = {
  "1B030": "SMI-V กลุ่ม 1",
  "1B031": "SMI-V กลุ่ม 2",
  "1B032": "SMI-V กลุ่ม 3",
  "1B033": "SMI-V กลุ่มอื่นๆ",
};

export const diagnosisBreakdown = Object.entries(
  amphoeList.reduce<Record<string, number>>((acc, name) => {
    const entry = indicator1[name];
    if (entry.error) return acc;
    for (const d of entry.diagnoses) {
      acc[d.code] = (acc[d.code] ?? 0) + d.total;
    }
    return acc;
  }, {})
)
  .map(([code, total]) => ({ code, name: diagnosisCodeNames[code] ?? code, total }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function getAmphoeDetail(name: string) {
  return indicator1[name];
}

/** สัดส่วนกลุ่มวินิจฉัย (1B030-1B033) ต่ออำเภอ — matrix สำหรับ heatmap */
export const diagnosisGroupCodes = ["1B030", "1B031", "1B032", "1B033"];

export const amphoeDiagnosisMatrix = amphoeStats.map(({ amphoe }) => {
  const entry = indicator1[amphoe];
  const byCode: Record<string, number> = {};
  for (const code of diagnosisGroupCodes) byCode[code] = 0;
  for (const d of entry.diagnoses) byCode[d.code] = d.total;
  return { amphoe, byCode, total: entry.summary?.total ?? 0 };
});

/** สัดส่วนตามกลุ่มการวินิจฉัย ICD ทั้งจังหวัด (รวมทุกอำเภอ, ทุกกลุ่ม 1B030-1B033) */
const icdFields: (keyof DiagnosisRow)[] = [
  "f00_09", "f10_19", "f20_29", "f30_39", "f40_48", "f50_59",
  "f60_69", "f70_79", "f80_89", "f90_98", "other", "x60_84",
];
const icdLabels: Record<string, string> = {
  f00_09: "F00–F09 (สมองเสื่อม/อินทรีย์)",
  f10_19: "F10–F19 (สารเสพติด)",
  f20_29: "F20–F29 (จิตเภท)",
  f30_39: "F30–F39 (อารมณ์)",
  f40_48: "F40–F48 (วิตกกังวล)",
  f50_59: "F50–F59 (พฤติกรรม/สรีระ)",
  f60_69: "F60–F69 (บุคลิกภาพ)",
  f70_79: "F70–F79 (ปัญญาอ่อน)",
  f80_89: "F80–F89 (พัฒนาการ)",
  f90_98: "F90–F98 (เริ่มในวัยเด็ก)",
  other: "อื่นๆ",
  x60_84: "X60–X84 (ทำร้ายตนเอง)",
};

export const icdCategoryBreakdown = icdFields
  .map((field) => ({
    key: field as string,
    label: icdLabels[field as string] ?? String(field),
    total: amphoeList.reduce((sum, name) => {
      const entry = indicator1[name];
      if (entry.error || !entry.summary) return sum;
      return sum + (Number(entry.summary[field]) || 0);
    }, 0),
  }))
  .sort((a, b) => b.total - a.total);

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 1 */
export const indicator1Insights = (() => {
  const top = amphoeStats[0];
  const bottom = amphoeStats[amphoeStats.length - 1];
  const top3Total = amphoeStats.slice(0, 3).reduce((sum, a) => sum + a.total, 0);
  const top3Share = provinceTotal > 0 ? Math.round((top3Total / provinceTotal) * 1000) / 10 : 0;
  const avgPerAmphoe = amphoeList.length > 0 ? Math.round(provinceTotal / amphoeList.length) : 0;
  const dominantIcd = icdCategoryBreakdown[0];
  const dominantGroup = diagnosisBreakdown.slice().sort((a, b) => b.total - a.total)[0];
  return { top, bottom, top3Share, avgPerAmphoe, dominantIcd, dominantGroup };
})();

/** คอลัมน์ตารางตัวชี้วัด 1 ตรงกับหน้า HDC ทุกคอลัมน์ */
export const indicator1TableColumns = [
  "SMI-V ที่มารับบริการ",
  "รวมคนต่อสถานพยาบาล",
  "F00.xx-F09.xx",
  "F10.xx-F19.xx",
  "F20.xx-F29.xx",
  "F30.xx-F39.xx",
  "F40.xx-F48.xx",
  "F50.xx-F59.xx",
  "F60.xx-F69.xx",
  "F70.xx-F79.xx",
  "F80.xx-F89.xx",
  "F90.xx-F90.xx",
  "Other",
  "X60.xx-X84.xx",
];

export function getAmphoeFullTable(name: string) {
  const entry = indicator1[name];
  if (!entry || entry.error) return null;
  const toRow = (d: DiagnosisRow) => [
    d.code,
    d.total,
    d.f00_09,
    d.f10_19,
    d.f20_29,
    d.f30_39,
    d.f40_48,
    d.f50_59,
    d.f60_69,
    d.f70_79,
    d.f80_89,
    d.f90_98,
    d.other,
    d.x60_84,
  ];
  const rows = entry.diagnoses.map(toRow);
  if (entry.summary) rows.push(toRow(entry.summary));
  return { columns: indicator1TableColumns, headerRows: entry.headerRows, rows };
}


/** ตัวชี้วัด 2 — การเข้าถึงบริการต่อเนื่องและไม่ก่อความรุนแรงซ้ำ (ระดับจังหวัด) */
export const indicator2Summary = indicator2.dataRows.find((r) => r.area !== "รวม") ?? indicator2.dataRows[0];

// Column order per scripts/extract-indicator.js parseKpiTable (values[] = col1..col14):
// 0 total-old(B) 1 new(C) 2 total-current(D) 3 accessRate%(E) 4 no-repeat(F) 5 repeatRate%(G)
// 6 population(H) 7 estimate(I) 8 followUp1x(J) 9 followUp2x+(K) 10 rate2x%(L)... (M,N,O follow)
export const indicator2Metrics = indicator2Summary
  ? {
      area: indicator2Summary.area,
      oldPatients: indicator2Summary.values[0], // B
      newPatients: indicator2Summary.values[1], // C
      totalPatients: indicator2Summary.values[2], // D
      accessRate: indicator2Summary.values[3], // E %
      noRepeatViolence: indicator2Summary.values[4], // F
      continuousCareRate: indicator2Summary.values[5], // G %
      population: indicator2Summary.values[6], // H
      estimate: indicator2Summary.values[7], // I
      followUp1x: indicator2Summary.values[8], // J
      followUp1xNoRepeat: indicator2Summary.values[9], // K
      followUp1xRate: indicator2Summary.values[10], // L %
      followUp2xPlus: indicator2Summary.values[11], // M
      followUp2xPlusNoRepeat: indicator2Summary.values[12], // N
      followUp2xPlusRate: indicator2Summary.values[13], // O %
    }
  : null;

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 2 */
export const indicator2Insights = (() => {
  const m = indicator2Metrics;
  if (!m) return null;
  const newShare = m.totalPatients > 0 ? Math.round((m.newPatients / m.totalPatients) * 1000) / 10 : 0;
  const oldShare = 100 - newShare;
  const followUpGap = m.followUp1x - m.followUp2xPlus;
  const populationCoverage = m.population > 0 ? Math.round((m.totalPatients / m.population) * 10000) / 100 : 0;
  const estimateGap = m.estimate - m.totalPatients;
  const rateDelta = Math.round((m.followUp2xPlusRate - m.followUp1xRate) * 10) / 10;
  return { newShare, oldShare, followUpGap, populationCoverage, estimateGap, rateDelta };
})();

export const indicator2Name = indicator2.name;
export const indicator2ExtractedAt = indicator2.extractedAt;
export const indicator2ProcessedDate = indicator2.processedDate;
export const indicator2TemplateUrl = "https://fileex.moph.go.th/media/r3yveog8x2yk4ug0tca4z-2569.pdf";
export const indicator1Name: string = (indicatorsConfig as { indicator1: { name: string } }).indicator1.name;

/** ตารางเต็มตัวชี้วัด 2 — ตรงกับคอลัมน์บนหน้า HDC (คอลัมน์ leaf ที่ align กับข้อมูลจริงแล้ว) */
export const indicator2TableColumns = indicator2.columns;
export const indicator2TableHeaderRows = indicator2.headerRows;
export const indicator2TableRows = indicator2.dataRows.map((r) => r.raw);

/** ลิงก์ต้นฉบับไปยังหน้ารายงานจริงบน HDC */
const HDC_BASE_URL = "https://hdc.moph.go.th/stn/public/standard-report-detail";
export const indicator1SourceUrl = `${HDC_BASE_URL}/${(indicatorsConfig as { indicator1: { reportCode: string } }).indicator1.reportCode}`;
export const indicator2SourceUrl = `${HDC_BASE_URL}/${indicator2.reportCode}`;
export const indicator3SourceUrl = `${HDC_BASE_URL}/${indicator3.reportCode}`;

/**
 * ตัวชี้วัด 3 — ร้อยละผู้ป่วย SMI-V ไม่ก่อความรุนแรงซ้ำ, มุมมอง "รายหน่วยบริการ"
 * ดึงแยกตามอำเภอจริงผ่าน automate (Playwright ควบคุม dropdown มุมมอง + อำเภอ
 * บนหน้าเว็บ HDC จริง แล้วกด "ดูรายงาน" ทีละอำเภอ) — ไม่ใช่ province-level อีกต่อไป
 */
export const indicator3Name = indicator3.name;
export const indicator3ViewMode = indicator3.viewMode;
export const indicator3TemplateUrl = "https://fileex.moph.go.th/media/1b64b51e4bf2edb57d2ddd1c316d48b1-2565.png";
export const indicator3AmphoeList = Object.keys(indicator3.byAmphoe).filter(
  (name) => !indicator3.byAmphoe[name].error
);

export function getIndicator3FacilityTable(amphoeName: string) {
  const entry = indicator3.byAmphoe[amphoeName];
  if (!entry || entry.error || !entry.columns || !entry.dataRows) return null;
  return { columns: entry.columns, headerRows: entry.headerRows, rows: entry.dataRows, extractedAt: entry.extractedAt };
}

export const indicator3ExtractedAt = indicator3AmphoeList
  .map((name) => indicator3.byAmphoe[name].extractedAt)
  .filter(Boolean)
  .sort()
  .at(-1);

export const indicator3ProcessedDate = indicator3AmphoeList
  .map((name) => indicator3.byAmphoe[name].processedDate)
  .filter(Boolean)
  .sort()
  .at(-1);

/** สรุปสถิติต่ออำเภอ: รวมค่าจากทุกหน่วยบริการในอำเภอนั้น (ไม่รวมแถว "รวม" ที่ HDC แถมมาในตาราง กันนับซ้ำ) */
export const indicator3AmphoeStats = indicator3AmphoeList
  .map((amphoeName) => {
    const entry = indicator3.byAmphoe[amphoeName];
    const rows = (entry.dataRows ?? []).filter((r) => r.area.trim() !== "รวม");
    const sum = (idx: number) => rows.reduce((acc, r) => acc + (r.values[idx] ?? 0), 0);
    const cumulative = sum(0); // สะสม(คน) ปีงบ 2559-2568
    const newCases = sum(1); // รายใหม่(คน) ปีงบปัจจุบัน
    const repeatViolence = sum(2); // ก่อความรุนแรงซ้ำ (คน)
    const base = cumulative + newCases;
    const repeatRate = base > 0 ? Math.round((repeatViolence / base) * 10000) / 100 : 0;
    return {
      amphoe: amphoeName,
      facilityCount: rows.length,
      cumulative,
      newCases,
      repeatViolence,
      repeatRate,
    };
  })
  .sort((a, b) => b.repeatRate - a.repeatRate);

export const indicator3Metrics = indicator3AmphoeStats.reduce(
  (acc, item) => ({
    cumulative: acc.cumulative + item.cumulative,
    newCases: acc.newCases + item.newCases,
    repeatViolence: acc.repeatViolence + item.repeatViolence,
  }),
  { cumulative: 0, newCases: 0, repeatViolence: 0 }
);
const indicator3MetricsBase = indicator3Metrics.cumulative + indicator3Metrics.newCases;
export const indicator3RepeatRate =
  indicator3MetricsBase > 0 ? Math.round((indicator3Metrics.repeatViolence / indicator3MetricsBase) * 10000) / 100 : 0;

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 3 */
export const indicator3Insights = (() => {
  const sorted = indicator3AmphoeStats; // เรียงตาม repeatRate มากไปน้อยอยู่แล้ว
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const totalFacilities = sorted.reduce((sum, a) => sum + a.facilityCount, 0);
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.repeatRate, 0) / sorted.length) * 100) / 100 : 0;
  const aboveAvgCount = sorted.filter((a) => a.repeatRate > avgRate).length;
  const zeroRepeatCount = sorted.filter((a) => a.repeatViolence === 0).length;
  return { highest, lowest, totalFacilities, avgRate, aboveAvgCount, zeroRepeatCount };
})();

/** วิเคราะห์ภาพรวมโดยผสานข้อมูลจากทั้งสองตัวชี้วัด */
export const overviewInsights = indicator2Metrics
  ? {
      coverageRate: provinceTotal > 0 ? Math.round((indicator2Metrics.totalPatients / provinceTotal) * 1000) / 10 : 0,
      untrackedPatients: Math.max(provinceTotal - indicator2Metrics.totalPatients, 0),
      topAmphoeShare: amphoeStats[0] && provinceTotal > 0 ? Math.round((amphoeStats[0].total / provinceTotal) * 100) : 0,
      dominantDiagnosis: [...diagnosisBreakdown].sort((a, b) => b.total - a.total)[0],
    }
  : null;

/**
 * ตัวชี้วัด 4 — จำนวนผู้ป่วยจิตเวชยาเสพติดก่อความรุนแรง (SMI-V) ที่ขาดการรักษาก่อความรุนแรงซ้ำ
 * จำแนกตามประเภทความรุนแรง (ระดับจังหวัด, มุมมองรายพื้นที่เขตพื้นที่)
 */
export const indicator4Name = indicator4.name;
export const indicator4ExtractedAt = indicator4.extractedAt;
export const indicator4ProcessedDate = indicator4.processedDate;
export const indicator4SourceUrl = `${HDC_BASE_URL}/${indicator4.reportCode}`;
export const indicator4TemplateUrl = "https://fileex.moph.go.th/media/pepa25tv0dy1coasj2c8w-2569.pdf";
export const indicator4TableColumns = indicator4.columns;
export const indicator4TableHeaderRows = indicator4.headerRows;
export const indicator4TableRows = indicator4.dataRows.map((r) => r.raw);

export const indicator4Summary = indicator4.dataRows.find((r) => r.area === "รวม") ?? indicator4.dataRows[0];

// Column order per parseKpiTable leaf headers:
// 0 total-to-date, 1 treated-current-year, 2 no-repeat(LowRisk), 3 repeat-violence-current-year,
// then 6 groups (V1..V4) x [count, defaulted>1mo] = index 4..27, then repeat-by-severity 28..31, 32 = รวมทั้งหมด
export const indicator4Metrics = indicator4Summary
  ? {
      totalToDate: indicator4Summary.values[0] ?? 0,
      treatedCurrentYear: indicator4Summary.values[1] ?? 0,
      noRepeatViolence: indicator4Summary.values[2] ?? 0,
      repeatViolenceCurrentYear: indicator4Summary.values[3] ?? 0,
      repeatTotal: indicator4Summary.values[indicator4Summary.values.length - 1] ?? 0,
    }
  : null;
const indicator4Base = (indicator4Metrics?.noRepeatViolence ?? 0) + (indicator4Metrics?.repeatViolenceCurrentYear ?? 0);
export const indicator4RepeatRate =
  indicator4Base > 0 ? Math.round(((indicator4Metrics?.repeatViolenceCurrentYear ?? 0) / indicator4Base) * 10000) / 100 : 0;

/** จำแนกตามประเภทความรุนแรง SMI-V1–V4: จำนวนผู้ป่วยที่มารักษา, ขาดการรักษา, ก่อความรุนแรงซ้ำ ต่อกลุ่ม */
export const indicator4SeverityBreakdown = (() => {
  const v = indicator4Summary?.values ?? [];
  // values[4..27] = 4 กลุ่ม (V1-V4) x 3 ประเภทที่อยู่ (Type1/Type3/อื่นๆ) x [count, defaulted]
  // values[28..31] = ก่อความรุนแรงซ้ำแยกตาม V1-V4
  const groups = ["V1", "V2", "V3", "V4"];
  return groups.map((g, gi) => {
    const base = 4 + gi * 6;
    const type1 = { count: v[base] ?? 0, defaulted: v[base + 1] ?? 0 };
    const type3 = { count: v[base + 2] ?? 0, defaulted: v[base + 3] ?? 0 };
    const other = { count: v[base + 4] ?? 0, defaulted: v[base + 5] ?? 0 };
    const treated = type1.count + type3.count + other.count;
    const defaulted = type1.defaulted + type3.defaulted + other.defaulted;
    const repeatViolence = v[28 + gi] ?? 0;
    return { group: g, treated, defaulted, repeatViolence, type1, type3, other };
  });
})();

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 4 */
export const indicator4Insights = (() => {
  const groups = indicator4SeverityBreakdown;
  const totalTreated = groups.reduce((sum, g) => sum + g.treated, 0);
  const totalDefaulted = groups.reduce((sum, g) => sum + g.defaulted, 0);
  const dominant = groups.slice().sort((a, b) => b.treated - a.treated)[0];
  const mostDefaulted = groups.slice().sort((a, b) => b.defaulted - a.defaulted)[0];
  const mostRepeat = groups.slice().sort((a, b) => b.repeatViolence - a.repeatViolence)[0];
  const defaultRate = totalTreated > 0 ? Math.round((totalDefaulted / totalTreated) * 1000) / 10 : 0;
  return { totalTreated, totalDefaulted, dominant, mostDefaulted, mostRepeat, defaultRate };
})();

/**
 * ตัวชี้วัด 5 — ร้อยละผู้ป่วย SMI-V ที่มารับบริการในปีงบประมาณได้รับการติดตามตามเกณฑ์
 * จำแนกรายใหม่/รายเก่า, มุมมอง "รายหน่วยบริการ" แยกตามอำเภอ — automate ผ่าน browser จริง
 * (รูปแบบเดียวกับตัวชี้วัด 3: เปลี่ยนมุมมอง + เลือกอำเภอ + กดดูรายงาน ทีละอำเภอ)
 */
export const indicator5Name = indicator5.name;
export const indicator5ViewMode = indicator5.viewMode;
export const indicator5SourceUrl = `${HDC_BASE_URL}/${indicator5.reportCode}`;
export const indicator5AmphoeList = Object.keys(indicator5.byAmphoe).filter(
  (name) => !indicator5.byAmphoe[name].error
);

export function getIndicator5FacilityTable(amphoeName: string) {
  const entry = indicator5.byAmphoe[amphoeName];
  if (!entry || entry.error || !entry.columns || !entry.dataRows) return null;
  return { columns: entry.columns, headerRows: entry.headerRows, rows: entry.dataRows, extractedAt: entry.extractedAt };
}

export const indicator5ExtractedAt = indicator5AmphoeList
  .map((name) => indicator5.byAmphoe[name].extractedAt)
  .filter(Boolean)
  .sort()
  .at(-1);

export const indicator5ProcessedDate = indicator5AmphoeList
  .map((name) => indicator5.byAmphoe[name].processedDate)
  .filter(Boolean)
  .sort()
  .at(-1);

// Column order per parseKpiTable leaf headers (values[]):
// 0 total(B), 1 followed(A), 2 rate%[A/B], 3 new-total(B1), 4 new-followed(A1), 5 new-rate%,
// 6 old-total(B2), 7 old-followed(A2), 8 old-rate%
/** สรุปสถิติต่ออำเภอ: รวมค่าจากทุกหน่วยบริการในอำเภอนั้น (ไม่รวมแถว "รวม" ที่ HDC แถมมาในตาราง กันนับซ้ำ) */
export const indicator5AmphoeStats = indicator5AmphoeList
  .map((amphoeName) => {
    const entry = indicator5.byAmphoe[amphoeName];
    const rows = (entry.dataRows ?? []).filter((r) => r.area.trim() !== "รวม");
    const sum = (idx: number) => rows.reduce((acc, r) => acc + (r.values[idx] ?? 0), 0);
    const total = sum(0);
    const followed = sum(1);
    const followRate = total > 0 ? Math.round((followed / total) * 10000) / 100 : 0;
    return {
      amphoe: amphoeName,
      facilityCount: rows.length,
      total,
      followed,
      followRate,
    };
  })
  .sort((a, b) => b.followRate - a.followRate);

export const indicator5Metrics = indicator5AmphoeStats.reduce(
  (acc, item) => ({
    total: acc.total + item.total,
    followed: acc.followed + item.followed,
  }),
  { total: 0, followed: 0 }
);
export const indicator5FollowRate =
  indicator5Metrics.total > 0 ? Math.round((indicator5Metrics.followed / indicator5Metrics.total) * 10000) / 100 : 0;

/** จำแนกผู้ป่วยรายใหม่/รายเก่า รวมทุกอำเภอ (values[3..8]: new-total, new-followed, new-rate%, old-total, old-followed, old-rate%) */
export const indicator5NewOldBreakdown = (() => {
  let newTotal = 0, newFollowed = 0, oldTotal = 0, oldFollowed = 0;
  for (const name of indicator5AmphoeList) {
    const entry = indicator5.byAmphoe[name];
    const rows = (entry.dataRows ?? []).filter((r) => r.area.trim() !== "รวม");
    for (const r of rows) {
      newTotal += r.values[3] ?? 0;
      newFollowed += r.values[4] ?? 0;
      oldTotal += r.values[6] ?? 0;
      oldFollowed += r.values[7] ?? 0;
    }
  }
  const newRate = newTotal > 0 ? Math.round((newFollowed / newTotal) * 10000) / 100 : 0;
  const oldRate = oldTotal > 0 ? Math.round((oldFollowed / oldTotal) * 10000) / 100 : 0;
  return { newTotal, newFollowed, newRate, oldTotal, oldFollowed, oldRate };
})();

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 5 */
export const indicator5Insights = (() => {
  const sorted = indicator5AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const totalFacilities = sorted.reduce((sum, a) => sum + a.facilityCount, 0);
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.followRate, 0) / sorted.length) * 100) / 100 : 0;
  const belowAvgCount = sorted.filter((a) => a.followRate < avgRate).length;
  const fullyFollowedCount = sorted.filter((a) => a.followRate >= 100).length;
  return { highest, lowest, totalFacilities, avgRate, belowAvgCount, fullyFollowedCount };
})();

