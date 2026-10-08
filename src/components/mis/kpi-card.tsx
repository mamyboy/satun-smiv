"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, HeartPulse, Hospital, Microscope, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { kpiSeries, kpiValue, type KpiDef, type YearRange } from "@/lib/mis/data";
import { fmtPct } from "@/lib/mis/format";
import { CountUp } from "./count-up";
import { Panel } from "./panel";
import { EASE_OUT } from "./motion";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "ncd-opd": Stethoscope,
  "ncd-ipd": Hospital,
  "com-opd": Microscope,
  "com-ipd": HeartPulse,
};

export function KpiCard({ def, range, index }: { def: KpiDef; range: YearRange; index: number }) {
  const { value, change, prevYear } = kpiValue(def, range.end);
  const series = kpiSeries(def, range);
  const Icon = ICONS[def.id] ?? Stethoscope;
  const featured = index === 0;

  return (
    <Panel
      index={index}
      className={
        featured
          ? "overflow-hidden border-0 bg-[radial-gradient(120%_120%_at_100%_0%,#0b3a4a_0%,#061923_60%)] text-white"
          : "overflow-hidden"
      }
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={
              featured
                ? "grid size-10 place-items-center rounded-2xl bg-white/10 text-mis-reef"
                : "grid size-10 place-items-center rounded-2xl bg-mis-accent-soft text-mis-accent-strong"
            }
          >
            <Icon className="size-[19px]" />
          </span>
          {change !== null ? (
            <Badge
              tone={change > 0 ? "up" : "down"}
              className={featured ? (change > 0 ? "bg-mis-rose/20 text-[#ffb3bb]" : "bg-emerald-400/15 text-emerald-300") : undefined}
              title={`เทียบกับปี ${prevYear}`}
            >
              {change > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {fmtPct(change)}
            </Badge>
          ) : (
            <Badge tone="neutral" className={featured ? "bg-white/10 text-white/60" : undefined}>
              ปีแรก
            </Badge>
          )}
        </div>

        <p className={featured ? "mt-5 text-[12.5px] text-white/65" : "mt-5 text-[12.5px] text-mis-muted"}>{def.label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <CountUp
            value={value}
            className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-[32px]"
          />
          <span className={featured ? "text-[12px] text-white/50" : "text-[12px] text-mis-faint"}>ครั้ง</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className={featured ? "text-[11.5px] leading-snug text-white/45" : "text-[11.5px] leading-snug text-mis-faint"}>
            {def.hint}
            <br />
            ปี {range.end}
            {prevYear ? ` · เทียบ ${prevYear}` : ""}
          </p>
          <Sparkline values={series.map((s) => s.value)} light={featured} />
        </div>
      </div>
    </Panel>
  );
}

/** Minimal SVG sparkline with a path-draw entrance. */
function Sparkline({ values, light }: { values: number[]; light?: boolean }) {
  const w = 96;
  const h = 34;
  if (values.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / span) * (h - 8)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  const stroke = light ? "#65e6d3" : "#02b8c8";
  const gid = `spark-${light ? "l" : "d"}`;
  const key = values.join("-");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        key={`a-${key}`}
        d={area}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      />
      <motion.path
        key={`l-${key}`}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      />
      <motion.circle
        key={`c-${key}`}
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r={3}
        fill={stroke}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, duration: 0.25 }}
      />
    </svg>
  );
}
