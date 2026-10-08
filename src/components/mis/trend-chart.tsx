"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { trendSeries, type Category, type Setting, type YearRange } from "@/lib/mis/data";
import { fmtCompact, shortLabel } from "@/lib/mis/format";
import { ChartTooltip } from "./chart-tooltip";
import { ChartSkeleton, Loadable, Panel, PanelHeader } from "./panel";
import { SegmentedTabs } from "./segmented-tabs";
import { CHART_MS, DUR, EASE_OUT, SERIES_COLORS } from "./motion";

type DatasetId = "ncd-opd" | "ncd-ipd" | "com-opd" | "com-ipd";
const DATASETS: { value: DatasetId; label: string; category: Category; setting: Setting }[] = [
  { value: "ncd-opd", label: "NCD · นอก", category: "ncd", setting: "opd" },
  { value: "ncd-ipd", label: "NCD · ใน", category: "ncd", setting: "ipd" },
  { value: "com-opd", label: "ติดต่อ · นอก", category: "communicable", setting: "opd" },
  { value: "com-ipd", label: "ติดต่อ · ใน", category: "communicable", setting: "ipd" },
];

export function TrendChart({ range, ready, index }: { range: YearRange; ready: boolean; index: number }) {
  const [ds, setDs] = useState<DatasetId>("ncd-opd");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const conf = DATASETS.find((d) => d.value === ds)!;
  const { names, points } = useMemo(() => trendSeries(conf.category, conf.setting, range, 5), [conf, range]);
  const singleYear = points.length < 2;

  const toggle = (n: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (names.length - next.size > 1) next.add(n); // keep at least one series visible
      return next;
    });

  return (
    <Panel id="trend" index={index} className="xl:col-span-8">
      <PanelHeader
        icon={<TrendingUp />}
        title="แนวโน้มจำนวนครั้งรับบริการ — 5 กลุ่มโรคสูงสุด"
        description={`พ.ศ. ${range.start}${range.start !== range.end ? `–${range.end}` : ""} · คลิกคำอธิบายสัญลักษณ์เพื่อซ่อน/แสดงเส้น`}
        actions={
          <SegmentedTabs
            id="trend-ds"
            items={DATASETS}
            value={ds}
            onChange={(v) => {
              setDs(v);
              setHidden(new Set());
            }}
          />
        }
      />

      <div className="px-5 pb-2 pt-4 sm:px-6">
        <motion.ul layout className="flex flex-wrap gap-1.5">
          {names.map((n, i) => {
            const off = hidden.has(n);
            return (
              <motion.li layout key={`${ds}-${n}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: DUR.base }}>
                <button
                  onClick={() => toggle(n)}
                  title={n}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-[background-color,border-color,opacity] duration-200",
                    off ? "border-mis-line bg-transparent text-mis-faint opacity-70" : "border-transparent bg-mis-ink/[0.04] text-mis-ink-2 hover:bg-mis-ink/[0.07]",
                  )}
                >
                  <span
                    className="size-2.5 rounded-full transition-transform duration-200"
                    style={{ background: SERIES_COLORS[i], transform: off ? "scale(.6)" : "scale(1)", opacity: off ? 0.4 : 1 }}
                  />
                  {shortLabel(n, 30)}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <div className="px-2 pb-4 sm:px-4">
        <Loadable ready={ready} skeleton={<div className="px-3"><ChartSkeleton height={320} /></div>}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${ds}-${range.start}-${range.end}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="h-[320px]"
            >
              {singleYear && (
                <p className="px-4 pb-1 text-[12px] text-mis-muted">ช่วงที่เลือกมีเพียง 1 ปี — ขยายช่วงปีเพื่อดูแนวโน้ม</p>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
                  <defs>
                    {names.map((n, i) => (
                      <linearGradient key={n} id={`trend-g-${i}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={SERIES_COLORS[i]} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={SERIES_COLORS[i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e3ebef" strokeDasharray="4 6" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#5b6f7a", fontSize: 12 }}
                    tickFormatter={(v) => `พ.ศ. ${v}`}
                    padding={{ left: 18, right: 18 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={{ fill: "#94a6b0", fontSize: 11.5 }}
                    tickFormatter={(v: number) => fmtCompact(v)}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "#02b8c8", strokeOpacity: 0.35, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                    animationDuration={180}
                  />
                  {names.map((n, i) => (
                    <Area
                      key={n}
                      type="monotone"
                      dataKey={n}
                      name={n}
                      hide={hidden.has(n)}
                      stroke={SERIES_COLORS[i]}
                      strokeWidth={2.25}
                      fill={`url(#trend-g-${i})`}
                      dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 5.5, strokeWidth: 2.5, stroke: "#fff", fill: SERIES_COLORS[i] }}
                      isAnimationActive
                      animationDuration={CHART_MS.draw}
                      animationBegin={i * 70}
                      animationEasing="ease-out"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </Loadable>
      </div>
    </Panel>
  );
}
