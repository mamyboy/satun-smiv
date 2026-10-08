"use client";

import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";
import { BookOpenText, Calculator, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/mis/format";
import { CountUp } from "../count-up";
import { CHART_MS, DUR, EASE_OUT } from "../motion";

export const MALE = "#1f7fd1";
export const FEMALE = "#e5617f";
export const MALE_SOFT = "#9cc8ee";
export const FEMALE_SOFT = "#f3b1c0";

/** บล็อก "แหล่งที่มา / วิธีคิด" — แสดงทุก panel ตามข้อกำหนด */
export function SourceNote({
  source,
  method,
  formula,
  className,
}: {
  source: React.ReactNode;
  method: React.ReactNode;
  formula?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-5 mb-5 mt-1 grid gap-2 rounded-2xl border border-mis-line/70 bg-mis-surface-2/60 p-3 text-[11.5px] leading-relaxed sm:mx-6 lg:grid-cols-2", className)}>
      <div className="flex min-w-0 gap-2">
        <Database className="mt-0.5 size-3.5 shrink-0 text-mis-accent-strong" />
        <div className="min-w-0">
          <p className="font-semibold text-mis-ink-2">แหล่งที่มา</p>
          <div className="text-mis-muted">{source}</div>
        </div>
      </div>
      <div className="flex min-w-0 gap-2">
        <Calculator className="mt-0.5 size-3.5 shrink-0 text-mis-accent-strong" />
        <div className="min-w-0">
          <p className="font-semibold text-mis-ink-2">วิธีคิด</p>
          <div className="text-mis-muted">{method}</div>
          {formula && (
            <details className="mt-1 group">
              <summary className="inline-flex cursor-pointer items-center gap-1 text-mis-accent-strong">
                <BookOpenText className="size-3" /> สูตร / เงื่อนไขเต็ม
              </summary>
              <div className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white/80 p-2.5 font-mono text-[10.5px] text-mis-ink-2">{formula}</div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export function KpiTile({
  label,
  value,
  format = fmtNum,
  unit,
  hint,
  tone = "ink",
  index = 0,
}: {
  label: string;
  value: number | null;
  format?: (n: number) => string;
  unit?: string;
  hint?: React.ReactNode;
  tone?: "ink" | "male" | "female" | "accent" | "amber" | "rose";
  index?: number;
}) {
  const color = {
    ink: "text-mis-ink",
    male: "text-[#1f7fd1]",
    female: "text-[#d14a6a]",
    accent: "text-mis-accent-strong",
    amber: "text-[#b7791f]",
    rose: "text-[#c8414f]",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -2 }}
      className="min-w-0 rounded-2xl border border-mis-line/80 bg-white/90 p-4 shadow-mis"
    >
      <p className="truncate text-[12px] text-mis-muted" title={label}>{label}</p>
      <p className={cn("mt-1 text-[24px] font-semibold leading-tight tracking-[-0.02em] tabular-nums", color)}>
        {value == null ? "—" : <CountUp value={value} format={format} />}
        {unit && <span className="ml-1 text-[12px] font-normal text-mis-faint">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-[11px] leading-snug text-mis-faint">{hint}</p>}
    </motion.div>
  );
}

export interface PyramidDatum {
  band: string;
  m: number;
  f: number;
  rm?: number;
  rf?: number;
}

/**
 * พีระมิดประชากร: ชาย (ซ้าย, ค่าลบ) / หญิง (ขวา) — อายุมากอยู่บน
 * ถ้ามี rm/rf จะวาดเส้นอ้างอิง (เช่น ทะเบียนราษฎร) ซ้อนบนแท่ง
 */
export function PopulationPyramid({
  data,
  pct = false,
  height = 520,
  barName = ["ชาย", "หญิง"],
  refName = ["ชาย (อ้างอิง)", "หญิง (อ้างอิง)"],
}: {
  data: PyramidDatum[];
  pct?: boolean;
  height?: number;
  barName?: [string, string];
  refName?: [string, string];
}) {
  const total = data.reduce((a, d) => a + d.m + d.f, 0) || 1;
  const refTotal = data.reduce((a, d) => a + (d.rm ?? 0) + (d.rf ?? 0), 0) || 1;
  const hasRef = data.some((d) => d.rm != null);
  const rows = [...data].reverse().map((d) => ({
    band: d.band,
    m: -(pct ? (d.m / total) * 100 : d.m),
    f: pct ? (d.f / total) * 100 : d.f,
    rm: d.rm == null ? undefined : -(pct ? (d.rm / refTotal) * 100 : d.rm),
    rf: d.rf == null ? undefined : pct ? (d.rf / refTotal) * 100 : d.rf,
  }));
  const max = Math.max(...rows.flatMap((r) => [Math.abs(r.m), r.f, Math.abs(r.rm ?? 0), r.rf ?? 0]), 1);
  const tick = (v: number) => (pct ? `${Math.abs(v).toFixed(1)}%` : fmtNum(Math.abs(v)));
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} layout="vertical" stackOffset="sign" barCategoryGap={2} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke="rgba(6,25,35,.07)" />
          <XAxis type="number" domain={[-max * 1.05, max * 1.05]} tickFormatter={tick} tick={{ fontSize: 11, fill: "#6b7f8a" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="band" width={52} tick={{ fontSize: 11, fill: "#3d5260" }} axisLine={false} tickLine={false} interval={0} />
          <Tooltip
            cursor={{ fill: "rgba(2,184,200,.06)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="mis-glass rounded-2xl px-3.5 py-3 text-xs shadow-mis-hover">
                  <p className="mb-1.5 font-semibold text-mis-ink">อายุ {label} ปี</p>
                  {payload.map((p) => (
                    <p key={String(p.dataKey)} className="flex items-center gap-2 text-mis-muted">
                      <span className="size-2 rounded-full" style={{ background: p.color }} />
                      <span className="flex-1">{p.name}</span>
                      <span className="font-semibold tabular-nums text-mis-ink">{tick(Number(p.value))}</span>
                    </p>
                  ))}
                </div>
              ) : null
            }
          />
          <Bar dataKey="m" name={barName[0]} stackId="p" fill={MALE} radius={[6, 0, 0, 6]} animationDuration={CHART_MS.grow} />
          <Bar dataKey="f" name={barName[1]} stackId="p" fill={FEMALE} radius={[0, 6, 6, 0]} animationDuration={CHART_MS.grow} />
          {hasRef && <Line dataKey="rm" name={refName[0]} type="stepAfter" stroke="#061923" strokeWidth={1.6} dot={{ r: 2.2, fill: "#061923" }} animationDuration={CHART_MS.draw} />}
          {hasRef && <Line dataKey="rf" name={refName[1]} type="stepAfter" stroke="#061923" strokeWidth={1.6} strokeDasharray="4 3" dot={{ r: 2.2, fill: "#061923" }} animationDuration={CHART_MS.draw} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-mis-muted">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          {it.dashed ? (
            <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: it.color }} />
          ) : (
            <span className="size-2.5 rounded-full" style={{ background: it.color }} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** ตารางเรียงลำดับได้ทุกคอลัมน์ (generic) */
export function SortTable<T extends Record<string, unknown>>({
  rows,
  columns,
  initialSort,
  maxHeight = 520,
  footer,
}: {
  rows: T[];
  columns: { key: string; label: string; num?: boolean; render?: (r: T) => React.ReactNode; value?: (r: T) => number | string }[];
  initialSort?: { key: string; dir: 1 | -1 };
  maxHeight?: number;
  footer?: React.ReactNode;
}) {
  const [sort, setSort] = React.useState(initialSort ?? { key: columns[0].key, dir: 1 as 1 | -1 });
  const col = columns.find((c) => c.key === sort.key) ?? columns[0];
  const val = (r: T) => (col.value ? col.value(r) : (r[col.key] as number | string));
  const sorted = [...rows].sort((a, b) => {
    const x = val(a), y = val(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "th")) * sort.dir;
  });
  return (
    <div className="mis-scroll overflow-auto rounded-2xl border border-mis-line/70" style={{ maxHeight }}>
      <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
        <thead className="sticky top-0 z-10 bg-mis-surface-2/95 backdrop-blur">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                className={cn("border-b border-mis-line px-3 py-2.5 font-semibold text-mis-ink-2", c.num ? "text-right" : "text-left")}
              >
                <button
                  className="inline-flex items-center gap-1 hover:text-mis-accent-strong"
                  onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : c.num ? -1 : 1 }))}
                >
                  {c.label}
                  <span className="text-[10px] text-mis-faint">{sort.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} className="border-b border-mis-line/50 odd:bg-white even:bg-mis-surface-2/40 hover:bg-mis-accent-soft/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-2", c.num ? "text-right tabular-nums" : "text-left")}>
                  {c.render ? c.render(r) : c.num ? fmtNum(Number(r[c.key])) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot className="sticky bottom-0 bg-mis-surface-2/95 font-semibold">{footer}</tfoot>}
      </table>
    </div>
  );
}

export function PctBar({ pct, warn = 90 }: { pct: number; warn?: number }) {
  const ok = pct >= warn && pct <= 110;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-mis-ink/10">
        <span className={cn("absolute inset-y-0 left-0 rounded-full", ok ? "bg-mis-accent" : "bg-[#e5616f]")} style={{ width: `${Math.min(100, pct)}%` }} />
      </span>
      <span className={cn("tabular-nums", ok ? "text-mis-ink" : "text-[#c8414f]")}>{pct.toFixed(1)}%</span>
    </span>
  );
}
