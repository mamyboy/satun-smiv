"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarClock, History, Minus } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { indicator2Runs, indicator2Weekly } from "@/lib/hdc-data";
import { formatThaiShort, formatWeekRange } from "@/lib/indicator-history";

/** คอลัมน์ HDC ที่ติดตามความก้าวหน้า (index ตาม values[] ใน data.json = col1..col14) */
const METRICS = [
  { idx: 3, code: "E", label: "อัตราเข้าถึงบริการสะสม", unit: "%" },
  { idx: 13, code: "O", label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ", unit: "%" },
  { idx: 10, code: "L", label: "ติดตาม 1 ครั้ง ไม่ก่อซ้ำ", unit: "%" },
  { idx: 2, code: "D", label: "ผู้ป่วยทั้งหมด", unit: "คน" },
  { idx: 1, code: "C", label: "ผู้ป่วยรายใหม่", unit: "คน" },
  { idx: 4, code: "F", label: "ไม่ก่อความรุนแรงซ้ำ (สะสม)", unit: "คน" },
  { idx: 8, code: "J", label: "ติดตาม 1 ครั้ง", unit: "คน" },
  { idx: 11, code: "M", label: "ติดตาม ≥2 ครั้ง", unit: "คน" },
  { idx: 12, code: "N", label: "ติดตาม ≥2 ครั้ง ไม่ก่อซ้ำ", unit: "คน" },
] as const;

type Mode = "weekly" | "runs";

const fmt = (n: number, unit: string) =>
  unit === "%" ? n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n.toLocaleString("th-TH");

function Delta({ value, unit }: { value: number | null | undefined; unit: string }) {
  if (value == null) return <span className="trend-delta trend-delta-none">—</span>;
  const cls = value > 0 ? "trend-delta-up" : value < 0 ? "trend-delta-down" : "trend-delta-flat";
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`trend-delta ${cls}`}>
      <Icon size={11} />
      {sign}{fmt(value, unit)}{unit === "%" ? " จุด" : ""}
    </span>
  );
}

export default function Indicator2TrendSection() {
  const [mode, setMode] = useState<Mode>("weekly");
  const [metricIdx, setMetricIdx] = useState<number>(METRICS[0].idx);
  const metric = METRICS.find((m) => m.idx === metricIdx) ?? METRICS[0];

  const rows = useMemo(
    () =>
      mode === "weekly"
        ? indicator2Weekly.map((w) => ({
            key: w.weekStart,
            label: formatWeekRange(w.weekStart, w.weekEnd),
            short: formatThaiShort(w.weekStart, false),
            sub: `ข้อมูล ณ ${formatThaiShort(w.snapshot.processedDateISO)} · ${w.runs} รอบ`,
            values: w.snapshot.values,
            delta: w.delta,
          }))
        : indicator2Runs.map((r) => ({
            key: r.snapshot.processedDateISO,
            label: formatThaiShort(r.snapshot.processedDateISO),
            short: formatThaiShort(r.snapshot.processedDateISO, false),
            sub: `ดึงข้อมูล ${new Date(r.snapshot.extractedAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Bangkok" })}`,
            values: r.snapshot.values,
            delta: r.delta,
          })),
    [mode],
  );

  if (rows.length === 0) return null;

  const first = rows[0];
  const last = rows[rows.length - 1];
  const prev = rows.length > 1 ? rows[rows.length - 2] : null;
  const chartData = rows.map((r) => ({ label: r.short, full: r.label, value: r.values[metric.idx] }));
  const periodWord = mode === "weekly" ? "สัปดาห์" : "รอบ";
  const highlight = METRICS.slice(0, 4);

  return (
    <section id="indicator2-trend" className="panel trend-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ความก้าวหน้า</p>
          <h2>ประวัติการประมวลผล {mode === "weekly" ? "รายสัปดาห์" : "รายครั้ง"}</h2>
        </div>
        <div className="trend-toggle" role="tablist" aria-label="เลือกมุมมองช่วงเวลา">
          <button type="button" role="tab" aria-selected={mode === "weekly"} className={mode === "weekly" ? "active" : ""} onClick={() => setMode("weekly")}>
            <CalendarClock size={13} /> รายสัปดาห์
          </button>
          <button type="button" role="tab" aria-selected={mode === "runs"} className={mode === "runs" ? "active" : ""} onClick={() => setMode("runs")}>
            <History size={13} /> รายครั้งที่ประมวลผล
          </button>
        </div>
      </div>
      <p className="trend-caption">
        เก็บ snapshot อัตโนมัติทุกครั้งที่ประมวลผล ({indicator2Runs.length} รอบ, {indicator2Weekly.length} สัปดาห์) ·
        รายสัปดาห์ใช้ข้อมูลรอบล่าสุดของสัปดาห์ (จันทร์–อาทิตย์) · ช่วง {first.label} ถึง {last.label}
      </p>

      <div className="trend-kpis">
        {highlight.map((m) => {
          const now = last.values[m.idx];
          const vsPrev = prev ? now - prev.values[m.idx] : null;
          const vsFirst = now - first.values[m.idx];
          return (
            <button type="button" key={m.idx} className={`trend-kpi ${metric.idx === m.idx ? "active" : ""}`} onClick={() => setMetricIdx(m.idx)}>
              <span className="trend-kpi-label">{m.label} ({m.code})</span>
              <strong>{fmt(now, m.unit)}{m.unit === "%" ? "%" : ""}</strong>
              <span className="trend-kpi-row">เทียบ{periodWord}ก่อน <Delta value={vsPrev == null ? null : Math.round(vsPrev * 100) / 100} unit={m.unit} /></span>
              <span className="trend-kpi-row">เทียบ{periodWord}แรก <Delta value={Math.round(vsFirst * 100) / 100} unit={m.unit} /></span>
            </button>
          );
        })}
      </div>

      <div className="trend-chips" role="radiogroup" aria-label="เลือกตัวชี้วัดสำหรับกราฟ">
        {METRICS.map((m) => (
          <button type="button" key={m.idx} role="radio" aria-checked={metric.idx === m.idx} className={metric.idx === m.idx ? "active" : ""} onClick={() => setMetricIdx(m.idx)}>
            {m.code} · {m.label}
          </button>
        ))}
      </div>

      <div className="chart-wrap trend-chart" aria-label={`กราฟแนวโน้ม ${metric.label}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className="chart-tooltip">
                    <b>{fmt(payload[0].value as number, metric.unit)} {metric.unit}</b>
                    <span>{(payload[0].payload as { full: string }).full}</span>
                  </div>
                ) : null
              }
            />
            <Line type="monotone" dataKey="value" stroke="#4338ca" strokeWidth={2.5} dot={{ r: 3.5, fill: "#4338ca" }} activeDot={{ r: 5 }} animationDuration={700} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="trend-table-wrap">
        <table className="trend-table">
          <thead>
            <tr>
              <th>{mode === "weekly" ? "สัปดาห์" : "วันที่ประมวลผล"}</th>
              {METRICS.map((m) => (
                <th key={m.idx} title={m.label}>
                  {m.code}
                  <small>{m.label}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map((r) => (
              <tr key={r.key}>
                <td>
                  <b>{r.label}</b>
                  <small>{r.sub}</small>
                </td>
                {METRICS.map((m) => (
                  <td key={m.idx} className={metric.idx === m.idx ? "trend-col-active" : ""}>
                    <span className="trend-value">{fmt(r.values[m.idx], m.unit)}</span>
                    <Delta value={r.delta?.[m.idx]} unit={m.unit} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="trend-footnote">▲ เพิ่มขึ้น / ▼ ลดลง เทียบ{periodWord}ก่อนหน้า · ร้อยละแสดงส่วนต่างเป็น “จุด” (percentage point)</p>
    </section>
  );
}
