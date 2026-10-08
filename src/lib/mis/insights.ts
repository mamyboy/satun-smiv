import { rows, sumTotal, yearsInRange, type Category, type Setting, type Year, type YearRange } from "./data";
import { fmtNum, fmtPct } from "./format";

export type InsightTone = "alert" | "watch" | "positive" | "info";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  metric: string;
}

/** Every insight below is derived from the loaded data for the selected range — no hard-coded figures. */
export function buildInsights(range: YearRange): Insight[] {
  const ys = yearsInRange(range);
  if (ys.length === 0) return [];
  const first = ys[0];
  const last = ys[ys.length - 1];
  const out: Insight[] = [];

  // 1. Fastest-growing NCD (OPD) between first and last year of range.
  if (ys.length > 1) {
    const growth = rows("ncd", "opd", last)
      .map((r) => {
        const base = rows("ncd", "opd", first).find((b) => b.name === r.name)?.total ?? 0;
        return { name: r.name, base, now: r.total, ratio: base > 0 ? r.total / base : 0 };
      })
      .filter((g) => g.base >= 1000)
      .sort((a, b) => b.ratio - a.ratio)[0];
    if (growth && growth.ratio > 1.05) {
      out.push({
        id: "ncd-growth",
        tone: growth.ratio >= 1.5 ? "alert" : "watch",
        title: `${growth.name} เพิ่มเร็วที่สุดในกลุ่ม NCD`,
        body: `ผู้ป่วยนอกเพิ่มจาก ${fmtNum(growth.base)} เป็น ${fmtNum(growth.now)} ครั้ง (พ.ศ. ${first}→${last}) ควรทบทวนระบบคัดกรองและติดตามต่อเนื่อง`,
        metric: `×${growth.ratio.toFixed(2)}`,
      });
    }
  }

  // 2. Largest NCD burden + female share (OPD, last year).
  const ncdLast = rows("ncd", "opd", last);
  const top = [...ncdLast].sort((a, b) => b.total - a.total)[0];
  if (top) {
    const femaleShare = (top.female / top.total) * 100;
    out.push({
      id: "ncd-burden",
      tone: "info",
      title: `${top.name} คือภาระบริการ NCD อันดับ 1`,
      body: `ปี ${last} มี ${fmtNum(top.total)} ครั้ง โดยเป็นเพศหญิง ${fmtPct(femaleShare, false)} — พิจารณาออกแบบบริการเชิงรุกที่เข้าถึงกลุ่มหญิงวัยทำงาน/สูงอายุ`,
      metric: fmtPct(femaleShare, false),
    });
  }

  // 3. Biggest year-over-year swing among communicable diseases (IPD), last vs previous.
  if (ys.length > 1) {
    const prev = ys[ys.length - 2];
    const swing = rows("communicable", "ipd", last)
      .map((r) => {
        const p = rows("communicable", "ipd", prev).find((x) => x.name === r.name)?.total ?? 0;
        return { name: r.name, prev: p, now: r.total, delta: r.total - p };
      })
      .filter((s) => s.prev >= 50)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
    if (swing) {
      const pct = ((swing.now - swing.prev) / swing.prev) * 100;
      out.push({
        id: "com-swing",
        tone: pct > 0 ? "alert" : "positive",
        title: `${swing.name} (ผู้ป่วยใน) ${pct > 0 ? "เพิ่มขึ้น" : "ลดลง"}ชัดเจน`,
        body: `จาก ${fmtNum(swing.prev)} เป็น ${fmtNum(swing.now)} ครั้ง (พ.ศ. ${prev}→${last}) ${pct > 0 ? "เฝ้าระวังการระบาดและเตรียมเตียง" : "สะท้อนผลการควบคุมโรคที่ดีขึ้น"}`,
        metric: fmtPct(pct),
      });
    }
  }

  // 4. Overall communicable trend (OPD) across range.
  if (ys.length > 1) {
    const a = sumTotal(rows("communicable", "opd", first)).total;
    const b = sumTotal(rows("communicable", "opd", last)).total;
    const pct = ((b - a) / a) * 100;
    out.push({
      id: "com-trend",
      tone: pct < 0 ? "positive" : "watch",
      title: `ภาพรวมโรคติดต่อผู้ป่วยนอก ${pct < 0 ? "มีแนวโน้มลดลง" : "มีแนวโน้มเพิ่มขึ้น"}`,
      body: `รวม A00–B99 ปี ${first} = ${fmtNum(a)} ครั้ง, ปี ${last} = ${fmtNum(b)} ครั้ง`,
      metric: fmtPct(pct),
    });
  }

  return out;
}

export function shareBySex(category: Category, setting: Setting, year: Year) {
  const s = sumTotal(rows(category, setting, year));
  return [
    { name: "ชาย", value: s.male },
    { name: "หญิง", value: s.female },
  ];
}
