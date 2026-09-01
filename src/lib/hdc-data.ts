import indicator1Raw from "../../amphoe-data/indicator1/data.json";
import indicator2Raw from "../../amphoe-data/indicator2/data.json";
import indicator3Raw from "../../amphoe-data/indicator3/data.json";
import indicator4Raw from "../../amphoe-data/indicator4/data.json";
import indicator5Raw from "../../amphoe-data/indicator5/data.json";
import indicatorRelate14Raw from "../../amphoe-data/indicator_relate_14/data.json";
import indicatorRelate15Raw from "../../amphoe-data/indicator_relate_15/data.json";
import indicatorRelate16Raw from "../../amphoe-data/indicator_relate_16/data.json";
import indicatorRelate21_2Raw from "../../amphoe-data/indicator_relate_21_2/data.json";
import indicatorRelate21_6Raw from "../../amphoe-data/indicator_relate_21_6/data.json";
import indicatorRelate21_1Raw from "../../amphoe-data/indicator_relate_21_1/data.json";
import indicatorRelate21_4Raw from "../../amphoe-data/indicator_relate_21_4/data.json";
import indicatorRelate21_7Raw from "../../amphoe-data/indicator_relate_21_7/data.json";
import indicatorRelate22_1Raw from "../../amphoe-data/indicator_relate_22_1/data.json";
import indicatorRelate22_2Raw from "../../amphoe-data/indicator_relate_22_2/data.json";
import indicatorRelate22_3Raw from "../../amphoe-data/indicator_relate_22_3/data.json";
import indicatorRelate22_4Raw from "../../amphoe-data/indicator_relate_22_4/data.json";
import indicatorRelate22_5Raw from "../../amphoe-data/indicator_relate_22_5/data.json";
import indicatorRelate22_6Raw from "../../amphoe-data/indicator_relate_22_6/data.json";
import indicatorRelate22_7Raw from "../../amphoe-data/indicator_relate_22_7/data.json";
import indicatorRelate23_4Raw from "../../amphoe-data/indicator_relate_23_4/data.json";
import indicatorRelate23_5Raw from "../../amphoe-data/indicator_relate_23_5/data.json";
import indicatorRelate23_6Raw from "../../amphoe-data/indicator_relate_23_6/data.json";
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
const indicatorRelate14 = indicatorRelate14Raw as Indicator2Data;
const indicatorRelate15 = indicatorRelate15Raw as Indicator2Data;
const indicatorRelate16 = indicatorRelate16Raw as Indicator2Data;
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

/**
 * ตัวชี้วัด 14 — ร้อยละของผู้ป่วยโรคจิตเภทได้รับการรักษาต่อเนื่องภายใน 6 เดือน (ระดับจังหวัด, มุมมองรายพื้นที่)
 * values[]: 0 total-current-year(C), 1 served-oct-feb(B), 2 followed-1x-6mo(A), 3 rate-A/B%, 4 rate-A/C%
 */
export const indicatorRelate14Name = indicatorRelate14.name;
export const indicatorRelate14ExtractedAt = indicatorRelate14.extractedAt;
export const indicatorRelate14ProcessedDate = indicatorRelate14.processedDate;
export const indicatorRelate14SourceUrl = `${HDC_BASE_URL}/${indicatorRelate14.reportCode}`;
export const indicatorRelate14TableColumns = indicatorRelate14.columns;
export const indicatorRelate14TableHeaderRows = indicatorRelate14.headerRows;
export const indicatorRelate14TableRows = indicatorRelate14.dataRows.map((r) => r.raw);

export const indicatorRelate14AmphoeStats = indicatorRelate14.dataRows
  .filter((r) => r.area.trim() !== "รวม")
  .map((r) => ({
    amphoe: r.area,
    totalCurrentYear: r.values[0] ?? 0,
    servedOctFeb: r.values[1] ?? 0,
    followed1x: r.values[2] ?? 0,
    rateAB: r.values[3] ?? 0,
    rateAC: r.values[4] ?? 0,
  }))
  .sort((a, b) => b.rateAB - a.rateAB);

export const indicatorRelate14Summary = indicatorRelate14.dataRows.find((r) => r.area === "รวม") ?? indicatorRelate14.dataRows[0];
export const indicatorRelate14Metrics = indicatorRelate14Summary
  ? {
      totalCurrentYear: indicatorRelate14Summary.values[0] ?? 0,
      servedOctFeb: indicatorRelate14Summary.values[1] ?? 0,
      followed1x: indicatorRelate14Summary.values[2] ?? 0,
      rateAB: indicatorRelate14Summary.values[3] ?? 0,
      rateAC: indicatorRelate14Summary.values[4] ?? 0,
    }
  : null;

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 14 */
export const indicatorRelate14Insights = (() => {
  const sorted = indicatorRelate14AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.rateAB, 0) / sorted.length) * 100) / 100 : 0;
  const belowAvgCount = sorted.filter((a) => a.rateAB < avgRate).length;
  return { highest, lowest, avgRate, belowAvgCount };
})();

/**
 * ตัวชี้วัด 15 — ร้อยละของผู้ป่วยจิตเภทที่เข้าถึงบริการสะสมได้รับการดูแลต่อเนื่อง (ระดับจังหวัด, มุมมองรายพื้นที่)
 * values[]: 0 cumulative-total, 1 served5yr[B], 2 self-follow1x, 3 other-follow1x, 4 total-follow1x[A1], 5 rate1x%,
 *           6 self-follow2x, 7 other-follow2x, 8 total-follow2x[A2], 9 rate2x%
 */
export const indicatorRelate15Name = indicatorRelate15.name;
export const indicatorRelate15ExtractedAt = indicatorRelate15.extractedAt;
export const indicatorRelate15ProcessedDate = indicatorRelate15.processedDate;
export const indicatorRelate15SourceUrl = `${HDC_BASE_URL}/${indicatorRelate15.reportCode}`;
export const indicatorRelate15TableColumns = indicatorRelate15.columns;
export const indicatorRelate15TableHeaderRows = indicatorRelate15.headerRows;
export const indicatorRelate15TableRows = indicatorRelate15.dataRows.map((r) => r.raw);

export const indicatorRelate15AmphoeStats = indicatorRelate15.dataRows
  .filter((r) => r.area.trim() !== "รวม")
  .map((r) => ({
    amphoe: r.area,
    cumulativeTotal: r.values[0] ?? 0,
    served5yr: r.values[1] ?? 0,
    followed1x: r.values[4] ?? 0,
    rate1x: r.values[5] ?? 0,
    followed2x: r.values[8] ?? 0,
    rate2x: r.values[9] ?? 0,
  }))
  .sort((a, b) => b.rate2x - a.rate2x);

export const indicatorRelate15Summary = indicatorRelate15.dataRows.find((r) => r.area === "รวม") ?? indicatorRelate15.dataRows[0];
export const indicatorRelate15Metrics = indicatorRelate15Summary
  ? {
      cumulativeTotal: indicatorRelate15Summary.values[0] ?? 0,
      served5yr: indicatorRelate15Summary.values[1] ?? 0,
      followed1x: indicatorRelate15Summary.values[4] ?? 0,
      rate1x: indicatorRelate15Summary.values[5] ?? 0,
      followed2x: indicatorRelate15Summary.values[8] ?? 0,
      rate2x: indicatorRelate15Summary.values[9] ?? 0,
    }
  : null;

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 15 */
export const indicatorRelate15Insights = (() => {
  const sorted = indicatorRelate15AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const followUpGap = (indicatorRelate15Metrics?.followed1x ?? 0) - (indicatorRelate15Metrics?.followed2x ?? 0);
  const rateDelta = Math.round(((indicatorRelate15Metrics?.rate2x ?? 0) - (indicatorRelate15Metrics?.rate1x ?? 0)) * 10) / 10;
  return { highest, lowest, followUpGap, rateDelta };
})();

/**
 * ตัวชี้วัด 16 — ร้อยละของผู้ป่วยโรคจิตเภทได้รับการรักษาต่อเนื่องภายใน 6 เดือน (Reverse) (ระดับจังหวัด, มุมมองรายพื้นที่)
 * values[]: 0 total-current-year(B), 1 followed-1x-6mo(A), 2 rate-A/B%
 */
export const indicatorRelate16Name = indicatorRelate16.name;
export const indicatorRelate16ExtractedAt = indicatorRelate16.extractedAt;
export const indicatorRelate16ProcessedDate = indicatorRelate16.processedDate;
export const indicatorRelate16SourceUrl = `${HDC_BASE_URL}/${indicatorRelate16.reportCode}`;
export const indicatorRelate16TableColumns = indicatorRelate16.columns;
export const indicatorRelate16TableHeaderRows = indicatorRelate16.headerRows;
export const indicatorRelate16TableRows = indicatorRelate16.dataRows.map((r) => r.raw);

export const indicatorRelate16AmphoeStats = indicatorRelate16.dataRows
  .filter((r) => r.area.trim() !== "รวม")
  .map((r) => ({
    amphoe: r.area,
    total: r.values[0] ?? 0,
    followed: r.values[1] ?? 0,
    rate: r.values[2] ?? 0,
  }))
  .sort((a, b) => b.rate - a.rate);

export const indicatorRelate16Summary = indicatorRelate16.dataRows.find((r) => r.area === "รวม") ?? indicatorRelate16.dataRows[0];
export const indicatorRelate16Metrics = indicatorRelate16Summary
  ? {
      total: indicatorRelate16Summary.values[0] ?? 0,
      followed: indicatorRelate16Summary.values[1] ?? 0,
      rate: indicatorRelate16Summary.values[2] ?? 0,
    }
  : null;

/** insight สรุปอัตโนมัติจากทุกมิติของตัวชี้วัด 16 */
export const indicatorRelate16Insights = (() => {
  const sorted = indicatorRelate16AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.rate, 0) / sorted.length) * 100) / 100 : 0;
  const belowAvgCount = sorted.filter((a) => a.rate < avgRate).length;
  return { highest, lowest, avgRate, belowAvgCount };
})();

const indicatorRelate21_2 = indicatorRelate21_2Raw as Indicator2Data;
const indicatorRelate21_6 = indicatorRelate21_6Raw as Indicator2Data;

/**
 * ตัวชี้วัด 21.2 — ร้อยละของผู้ป่วยที่มีความผิดปกติทางจิตและพฤติกรรมที่เกิดจากการใช้สารออกฤทธิ์ต่อจิตประสาท จำแนกตามสถานพยาบาล (workload)
 * values[]: 0 OPD-total(B1), 1 OPD-F10-19(A1), 2 OPD-rate%, 3 OPD-visits(C1), 4 IPD-total(B2), 5 IPD-F10-19(A2), 6 IPD-rate%, 7 IPD-days(C2)
 */
export const indicatorRelate21_2Name = indicatorRelate21_2.name;
export const indicatorRelate21_2ExtractedAt = indicatorRelate21_2.extractedAt;
export const indicatorRelate21_2ProcessedDate = indicatorRelate21_2.processedDate;
export const indicatorRelate21_2SourceUrl = `${HDC_BASE_URL}/${indicatorRelate21_2.reportCode}`;
export const indicatorRelate21_2TableColumns = indicatorRelate21_2.columns;
export const indicatorRelate21_2TableHeaderRows = indicatorRelate21_2.headerRows;
export const indicatorRelate21_2TableRows = indicatorRelate21_2.dataRows.map((r) => r.raw);

export const indicatorRelate21_2AmphoeStats = indicatorRelate21_2.dataRows
  .filter((r) => r.area.trim() !== "รวม")
  .map((r) => ({
    amphoe: r.area,
    opdTotal: r.values[0] ?? 0,
    opdF1019: r.values[1] ?? 0,
    opdRate: r.values[2] ?? 0,
    ipdTotal: r.values[4] ?? 0,
    ipdF1019: r.values[5] ?? 0,
    ipdRate: r.values[6] ?? 0,
  }))
  .sort((a, b) => b.opdRate - a.opdRate);

export const indicatorRelate21_2Summary = indicatorRelate21_2.dataRows.find((r) => r.area === "รวม") ?? indicatorRelate21_2.dataRows[0];
export const indicatorRelate21_2Metrics = indicatorRelate21_2Summary
  ? {
      opdTotal: indicatorRelate21_2Summary.values[0] ?? 0,
      opdF1019: indicatorRelate21_2Summary.values[1] ?? 0,
      opdRate: indicatorRelate21_2Summary.values[2] ?? 0,
      ipdTotal: indicatorRelate21_2Summary.values[4] ?? 0,
      ipdF1019: indicatorRelate21_2Summary.values[5] ?? 0,
      ipdRate: indicatorRelate21_2Summary.values[6] ?? 0,
    }
  : null;

export const indicatorRelate21_2Insights = (() => {
  const sorted = indicatorRelate21_2AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.opdRate, 0) / sorted.length) * 100) / 100 : 0;
  const belowAvgCount = sorted.filter((a) => a.opdRate < avgRate).length;
  return { highest, lowest, avgRate, belowAvgCount };
})();

/**
 * ตัวชี้วัด 21.6 — Retention Rate ผู้ป่วยยาเสพติดที่เข้าสู่กระบวนการบำบัดรักษาได้รับการดูแลติดตามต่อเนื่อง
 * values[]: index 8 = ผู้ป่วยจิตเวชทั้งหมดที่พ้นระยะ 1 ปี (คน), index 30-34 = Retention Rate % (5 กลุ่มโรค)
 */
export const indicatorRelate21_6Name = indicatorRelate21_6.name;
export const indicatorRelate21_6ExtractedAt = indicatorRelate21_6.extractedAt;
export const indicatorRelate21_6ProcessedDate = indicatorRelate21_6.processedDate;
export const indicatorRelate21_6SourceUrl = `${HDC_BASE_URL}/${indicatorRelate21_6.reportCode}`;
export const indicatorRelate21_6TableColumns = indicatorRelate21_6.columns;
export const indicatorRelate21_6TableHeaderRows = indicatorRelate21_6.headerRows;
export const indicatorRelate21_6TableRows = indicatorRelate21_6.dataRows.map((r) => r.raw);

export const indicatorRelate21_6AmphoeStats = indicatorRelate21_6.dataRows
  .filter((r) => r.area.trim() !== "รวม")
  .map((r) => ({
    amphoe: r.area,
    totalPsychFromBsot: r.values[28] ?? 0,
    retentionRateOverall: r.values[33] ?? 0,
  }))
  .sort((a, b) => b.retentionRateOverall - a.retentionRateOverall);

export const indicatorRelate21_6Summary = indicatorRelate21_6.dataRows.find((r) => r.area === "รวม") ?? indicatorRelate21_6.dataRows[0];
export const indicatorRelate21_6Metrics = indicatorRelate21_6Summary
  ? {
      totalPsychFromBsot: indicatorRelate21_6Summary.values[28] ?? 0,
      retentionRateOverall: indicatorRelate21_6Summary.values[33] ?? 0,
    }
  : null;

export const indicatorRelate21_6Insights = (() => {
  const sorted = indicatorRelate21_6AmphoeStats;
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const avgRate = sorted.length > 0 ? Math.round((sorted.reduce((sum, a) => sum + a.retentionRateOverall, 0) / sorted.length) * 100) / 100 : 0;
  const belowAvgCount = sorted.filter((a) => a.retentionRateOverall < avgRate).length;
  return { highest, lowest, avgRate, belowAvgCount };
})();

/** ตัวชี้วัดเพิ่มเติมระดับจังหวัด (ไม่มีมิติอำเภอ) — แสดงแบบการ์ด + ตาราง HDC ตรงต้นฉบับ */
export type SimpleIndicatorKey =
  | "21_1" | "21_4" | "21_7"
  | "22_1" | "22_2" | "22_3" | "22_4" | "22_5" | "22_6" | "22_7"
  | "23_4" | "23_5" | "23_6";

const simpleIndicatorRaw: Record<SimpleIndicatorKey, unknown> = {
  "21_1": indicatorRelate21_1Raw,
  "21_4": indicatorRelate21_4Raw,
  "21_7": indicatorRelate21_7Raw,
  "22_1": indicatorRelate22_1Raw,
  "22_2": indicatorRelate22_2Raw,
  "22_3": indicatorRelate22_3Raw,
  "22_4": indicatorRelate22_4Raw,
  "22_5": indicatorRelate22_5Raw,
  "22_6": indicatorRelate22_6Raw,
  "22_7": indicatorRelate22_7Raw,
  "23_4": indicatorRelate23_4Raw,
  "23_5": indicatorRelate23_5Raw,
  "23_6": indicatorRelate23_6Raw,
};

export type SimpleIndicatorData = {
  name: string;
  extractedAt?: string;
  processedDate?: string;
  sourceUrl: string;
  columns: string[];
  headerRows?: HdcHeaderCell[][];
  rows: (string | number)[][];
};

export function getSimpleIndicator(key: SimpleIndicatorKey): SimpleIndicatorData {
  const raw = simpleIndicatorRaw[key] as {
    name: string;
    extractedAt?: string;
    processedDate?: string;
    reportCode: string;
    columns: string[];
    headerRows?: HdcHeaderCell[][];
    dataRows: { raw: (string | number)[] }[];
  };
  return {
    name: raw.name,
    extractedAt: raw.extractedAt,
    processedDate: raw.processedDate,
    sourceUrl: `${HDC_BASE_URL}/${raw.reportCode}`,
    columns: raw.columns,
    headerRows: raw.headerRows,
    rows: raw.dataRows.map((r) => r.raw),
  };
}

export const simpleIndicatorLabels: Record<SimpleIndicatorKey, string> = {
  "21_1": "21.1",
  "21_4": "21.4",
  "21_7": "21.7",
  "22_1": "22.1",
  "22_2": "22.2",
  "22_3": "22.3",
  "22_4": "22.4",
  "22_5": "22.5",
  "22_6": "22.6",
  "22_7": "22.7",
  "23_4": "23.4",
  "23_5": "23.5",
  "23_6": "23.6",
};

/** วิเคราะห์มิติข้อมูลจากตารางของแต่ละตัวชี้วัด (สำหรับ Dashboard วิเคราะห์เหนือ Table) */
export type SimpleAnalysisBar = { label: string; value: number };
export type SimpleAnalysis =
  | { kind: "monthly"; data: SimpleAnalysisBar[]; total: number; unit: string }
  | { kind: "breakdown"; data: SimpleAnalysisBar[]; unit: string; axisLabel: string }
  | { kind: "donut"; data: SimpleAnalysisBar[]; unit: string; axisLabel: string; total: number }
  | { kind: "heatmap"; rows: string[]; cols: string[]; matrix: number[][]; unit: string; axisLabel: string }
  | { kind: "metrics"; items: { label: string; value: number; unit: string; note?: string }[] }
  | { kind: "zero"; note: string };

const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

type RawIndicatorRow = { area: string; values: number[]; raw: (string | number)[] };
type RawIndicatorData = { dataRows: RawIndicatorRow[] };

function firstDataRow(key: SimpleIndicatorKey): RawIndicatorRow | undefined {
  const raw = simpleIndicatorRaw[key] as unknown as RawIndicatorData;
  return raw.dataRows[0];
}

function allDataRows(key: SimpleIndicatorKey): RawIndicatorRow[] {
  const raw = simpleIndicatorRaw[key] as unknown as RawIndicatorData;
  return raw.dataRows;
}

/**
 * สร้าง heatmap matrix ทั่วไปจากตารางที่มีโครงสร้าง: แถว = กลุ่มอายุ,
 * คอลัมน์กลุ่มแรก 3 คอลัมน์ = จำนวนผู้รับบริการรวม (ข้าม), หลังจากนั้นแบ่งเป็นกลุ่มละ 4 คอลัมน์
 * (ชาย/หญิง/รวม/ร้อยละ) ต่อหมวดหมู่ (โรค/วิธี/สถานที่/ช่วงเวลา) — ใช้ค่า "รวม" (ตำแหน่งที่ 3 ในกลุ่ม) เป็นค่าตาราง
 */
function buildHeatmapFromGroupedColumns(
  key: SimpleIndicatorKey,
  opts: { skipFirstGroupCols?: number; maxCols?: number } = {}
): { rows: string[]; cols: string[]; matrix: number[][] } {
  const raw = simpleIndicatorRaw[key] as unknown as { headerRows?: HdcHeaderCell[][] };
  const headerRow = raw.headerRows?.[0] ?? [];
  const skip = opts.skipFirstGroupCols ?? 2; // ข้ามหัวคอลัมน์แรก (กลุ่มอายุ) และกลุ่ม "รวมทั้งหมด"
  const groupHeaders = headerRow.slice(skip); // แต่ละหัวคือหมวดหมู่ (โรค/วิธี/สถานที่ ฯลฯ) กว้าง 4 คอลัมน์
  const dataRows = allDataRows(key).filter((r) => r.area.trim() !== "รวม" && r.area.trim() !== "คำนวนอายุไม่ได้");

  // ตำแหน่งเริ่มต้นของแต่ละกลุ่มใน values[] คือหลังจากคอลัมน์ของกลุ่มก่อนหน้าทั้งหมด (ซึ่งกลุ่มแรกกว้าง 3 คอลัมน์ ไม่มี "ร้อยละ")
  const firstGroupWidth = 3;
  let cols = groupHeaders.map((h) => h.text.replace(/^\d+[.．]\s*/, ""));
  const colOffsets = groupHeaders.map((_, i) => firstGroupWidth + i * 4);

  let matrix = dataRows.map((r) => colOffsets.map((offset) => r.values[offset + 2] ?? 0)); // ตำแหน่งที่ 3 ในกลุ่ม = "รวม"

  if (opts.maxCols && cols.length > opts.maxCols) {
    const totals = colOffsets.map((_, ci) => matrix.reduce((s, row) => s + row[ci], 0));
    const order = totals.map((t, i) => i).sort((a, b) => totals[b] - totals[a]).slice(0, opts.maxCols);
    order.sort((a, b) => a - b);
    cols = order.map((i) => cols[i]);
    matrix = matrix.map((row) => order.map((i) => row[i]));
  }

  return { rows: dataRows.map((r) => r.area), cols, matrix };
}

/** ค่า % เด่นของตัวชี้วัด สำหรับแสดงในการ์ดหน้า hub (ดึงจากคอลัมน์ร้อยละ/อัตราหลักของแต่ละตัวชี้วัด) */
export type SimpleIndicatorHeadline = { value: number; label: string; unit: string } | null;

export function getSimpleIndicatorHeadline(key: SimpleIndicatorKey): SimpleIndicatorHeadline {
  const row = allDataRows(key).find((r) => r.area.trim() === "รวม" || r.area.trim() === "สตูล") ?? firstDataRow(key);
  if (!row) return null;
  switch (key) {
    case "21_1":
      return { value: row.values[2] ?? 0, label: "ร้อยละสารเสพติดสะสม", unit: "%" };
    case "21_4":
      return { value: row.values[3] ?? 0, label: "ร้อยละมีโรคร่วมทางจิต (F20.xx)", unit: "%" };
    case "21_7":
      return { value: row.values[4] ?? 0, label: "อัตราเข้าถึงบริการ", unit: "%" };
    case "22_1":
    case "22_2": {
      const percents = [6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54].map((i) => row.values[i] ?? 0);
      const max = Math.max(...percents);
      return { value: Math.round(max * 100) / 100, label: "ร้อยละกลุ่มโรคสูงสุด", unit: "%" };
    }
    case "22_3": {
      const total = row.values[4] ?? 0;
      return { value: total, label: "รวมผู้รับบริการ", unit: "คน" };
    }
    case "22_4":
      return { value: row.values[0] ?? 0, label: "จำนวนตั้งใจทำร้ายตนเอง", unit: "คน" };
    case "22_5":
    case "22_6":
    case "22_7": {
      const percents: number[] = [];
      for (let i = 6; i < row.values.length; i += 4) percents.push(row.values[i] ?? 0);
      const max = percents.length > 0 ? Math.max(...percents) : 0;
      return { value: Math.round(max * 100) / 100, label: "ร้อยละสูงสุดของวิธี/สถานที่/ช่วงเวลา", unit: "%" };
    }
    case "23_4":
    case "23_5":
    case "23_6":
      return { value: row.values[5] ?? 0, label: "ความชุกร้อยละประชากร", unit: "%" };
    default:
      return null;
  }
}

export function getSimpleIndicatorAnalysis(key: SimpleIndicatorKey): SimpleAnalysis {
  switch (key) {
    case "21_1": {
      const row = firstDataRow(key);
      if (!row) return { kind: "zero", note: "ไม่พบข้อมูลในช่วงเวลานี้" };
      const codes = ["F10.xx", "F11.xx", "F12.xx", "F13.xx", "F14.xx", "F15.xx", "F16.xx", "F17.xx", "F18.xx", "F19.xx"];
      const data = codes
        .map((code, i) => ({ label: code, value: (row.values[4 + i * 2] ?? 0) + (row.values[5 + i * 2] ?? 0) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);
      const total = data.reduce((s, d) => s + d.value, 0);
      return { kind: "donut", data, unit: "คน", axisLabel: "สัดส่วนตามรหัสโรค (สารเสพติด)", total };
    }
    case "21_4": {
      const rows = allDataRows(key).filter((r) => r.area.trim() !== "รวม");
      const byDisease = new Map<string, number>();
      for (const r of rows) {
        const name = r.area.trim();
        byDisease.set(name, (byDisease.get(name) ?? 0) + (r.values[1] ?? 0));
      }
      const shorten = (name: string) => {
        // ดึงชื่อสารที่แตกต่างกัน เช่น "...เกิดจากการเสพสุรา(F10.xx)" -> "สุรา (F10.xx)"
        const match = name.match(/เสพ(.+?)\(([^)]+)\)/);
        if (match) return `${match[1]} (${match[2]})`;
        return name.length > 28 ? name.slice(0, 26) + "…" : name;
      };
      const data = Array.from(byDisease.entries())
        .map(([label, value]) => ({ label: shorten(label), value }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      const total = data.reduce((s, d) => s + d.value, 0);
      return { kind: "donut", data, unit: "คน", axisLabel: "สัดส่วนตามกลุ่มโรคร่วมทางจิต (Top 8)", total };
    }
    case "21_7": {
      const row = firstDataRow(key);
      if (!row) return { kind: "zero", note: "ไม่พบข้อมูลในช่วงเวลานี้" };
      return {
        kind: "metrics",
        items: [
          { label: "อัตราเข้าถึงบริการ (รับบริการในจังหวัด)", value: row.values[4] ?? 0, unit: "%", note: "เทียบผู้ป่วยคาดประมาณจากความชุก" },
          { label: "อัตราเข้าถึงบริการ (มีทะเบียนบ้านในจังหวัด)", value: row.values[8] ?? 0, unit: "%", note: "เทียบผู้ป่วยคาดประมาณจากความชุก" },
          { label: "ร้อยละความชุกของโรค", value: row.values[0] ?? 0, unit: "%" },
        ],
      };
    }
    case "22_1": {
      const { rows, cols, matrix } = buildHeatmapFromGroupedColumns(key, { maxCols: 8 });
      return { kind: "heatmap", rows, cols, matrix, unit: "คน", axisLabel: "จำนวนผู้รับบริการ: กลุ่มอายุ × กลุ่มโรค (Top 8)" };
    }
    case "22_5":
    case "22_6":
    case "22_7": {
      const { rows, cols, matrix } = buildHeatmapFromGroupedColumns(key, { maxCols: 9 });
      const dimLabel = key === "22_5" ? "วิธีทำร้ายตนเอง" : key === "22_6" ? "สถานที่เกิดเหตุ" : "ช่วงเวลาเกิดเหตุ";
      return { kind: "heatmap", rows, cols, matrix, unit: "ครั้ง", axisLabel: `จำนวนครั้ง: กลุ่มอายุ × ${dimLabel}` };
    }
    case "22_2": {
      const row = firstDataRow(key);
      if (!row) return { kind: "zero", note: "ไม่พบข้อมูลในช่วงเวลานี้" };
      const categories = [
        "F00-F09", "F10-F19", "F20-F29", "F30-F39", "F40-F48", "F50-F59",
        "F60-F69", "F70-F79", "F80-F89", "F90-F98", "F99", "X60-X84", "X85-Y09",
      ];
      const data = categories
        .map((label, i) => ({ label, value: row.values[3 + i * 4 + 2] ?? 0 }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);
      const total = data.reduce((s, d) => s + d.value, 0);
      return { kind: "donut", data, unit: "คน", axisLabel: "สัดส่วนตามกลุ่มโรค (ICD-10)", total };
    }
    case "22_3": {
      const rows = allDataRows(key).filter((r) => String(r.raw[0]).trim() !== "รวม");
      const data = rows
        .map((r) => ({ label: String(r.raw[2] ?? r.area).slice(0, 30), value: r.values[4] ?? 0 }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      return { kind: "breakdown", data, unit: "คน", axisLabel: "จำแนกตามกลุ่มโรค/รายโรค (Top 10)" };
    }
    case "22_4":
    case "23_4":
    case "23_5":
    case "23_6": {
      const row = firstDataRow(key);
      if (!row) return { kind: "zero", note: "ไม่พบข้อมูลในช่วงเวลานี้" };
      const monthly = row.values.slice(-12);
      const total = monthly.reduce((s, v) => s + v, 0);
      const data = MONTH_LABELS.map((label, i) => ({ label, value: monthly[i] ?? 0 }));
      return { kind: "monthly", data, total, unit: key === "22_4" ? "ครั้ง" : "คน" };
    }
    default:
      return { kind: "zero", note: "ไม่พบข้อมูลในช่วงเวลานี้" };
  }
}

/**
 * ===== เปรียบเทียบข้ามตัวชี้วัด (Cross-indicator comparison) — เฉพาะหน้าแรก (Overview) =====
 * ตัวชี้วัดที่มีมิติ "รายอำเภอ" ร่วมกัน (7 อำเภอเดียวกัน) ใช้ชื่ออำเภอเป็นคีย์เชื่อมโยง
 * เพื่อเปรียบเทียบอัตราการรักษาต่อเนื่อง/เข้าถึงบริการ ระหว่างตัวชี้วัดต่างกลุ่มในอำเภอเดียวกัน
 */
export type AmphoeCompareRow = {
  amphoe: string;
  smiVTotal: number; // ตัวชี้วัด 1: จำนวนผู้ป่วย SMI-V
  repeatRate3: number | null; // ตัวชี้วัด 3: อัตราก่อความรุนแรงซ้ำ
  schizoRetention14: number | null; // ตัวชี้วัด 14: อัตรารักษาต่อเนื่องจิตเภท
  schizoRetention16: number | null; // ตัวชี้วัด 16: อัตรารักษาต่อเนื่องจิตเภท (อีกเกณฑ์)
  substanceOpdRate21_2: number | null; // ตัวชี้วัด 21.2: ร้อยละสารเสพติด OPD
  substanceRetention21_6: number | null; // ตัวชี้วัด 21.6: Retention Rate สารเสพติด
};

export const amphoeCompareRows: AmphoeCompareRow[] = amphoeList.map((amphoe) => {
  const smiV = amphoeStats.find((a) => a.amphoe === amphoe);
  const rep3 = indicator3AmphoeStats.find((a) => a.amphoe === amphoe);
  const r14 = indicatorRelate14AmphoeStats.find((a) => a.amphoe === amphoe);
  const r16 = indicatorRelate16AmphoeStats.find((a) => a.amphoe === amphoe);
  const r212 = indicatorRelate21_2AmphoeStats.find((a) => a.amphoe === amphoe);
  const r216 = indicatorRelate21_6AmphoeStats.find((a) => a.amphoe === amphoe);
  return {
    amphoe,
    smiVTotal: smiV?.total ?? 0,
    repeatRate3: rep3?.repeatRate ?? null,
    schizoRetention14: r14?.rateAB ?? null,
    schizoRetention16: r16?.rate ?? null,
    substanceOpdRate21_2: r212?.opdRate ?? null,
    substanceRetention21_6: r216?.retentionRateOverall ?? null,
  };
});

