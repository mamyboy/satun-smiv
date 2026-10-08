"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { rows, sumTotal, type Category, type Year } from "@/lib/mis/data";
import { fmtNum, fmtPct } from "@/lib/mis/format";
import { ChartTooltip } from "./chart-tooltip";
import { CountUp } from "./count-up";
import { Loadable, Panel, PanelHeader } from "./panel";
import { SegmentedTabs } from "./segmented-tabs";
import { CHART_MS, DUR, EASE_OUT, SERIES_COLORS } from "./motion";
import { Skeleton } from "@/components/ui/skeleton";

type Mode = "disease" | "sex";

export function CompositionDonut({ year, ready, index }: { year: Year; ready: boolean; index: number }) {
  const [category, setCategory] = useState<Category>("ncd");
  const [mode, setMode] = useState<Mode>("disease");
  const [active, setActive] = useState<number | null>(null);

  const { slices, total } = useMemo(() => {
    const list = rows(category, "opd", year);
    const t = sumTotal(list);
    if (mode === "sex") {
      return {
        total: t.total,
        slices: [
          { name: "หญิง", value: t.female, color: "#02b8c8" },
          { name: "ชาย", value: t.male, color: "#061923" },
          ...(t.total - t.male - t.female > 0 ? [{ name: "ไม่ระบุเพศ", value: t.total - t.male - t.female, color: "#c9d5db" }] : []),
        ],
      };
    }
    const sorted = [...list].sort((a, b) => b.total - a.total);
    const head = sorted.slice(0, 5).map((r, i) => ({ name: r.name, value: r.total, color: SERIES_COLORS[i] }));
    const rest = sorted.slice(5).reduce((s, r) => s + r.total, 0);
    return { total: t.total, slices: rest > 0 ? [...head, { name: "อื่น ๆ", value: rest, color: "#c9d5db" }] : head };
  }, [category, mode, year]);

  const focus = active !== null ? slices[active] : null;

  return (
    <Panel index={index} className="xl:col-span-5">
      <PanelHeader
        icon={<PieIcon />}
        title={`สัดส่วนผู้ป่วยนอก ปี ${year}`}
        description="จำนวนครั้ง · วางเมาส์บนส่วนของกราฟเพื่อดูรายละเอียด"
        actions={
          <SegmentedTabs
            id="donut-cat"
            size="sm"
            items={[
              { value: "ncd", label: "NCD" },
              { value: "communicable", label: "โรคติดต่อ" },
            ]}
            value={category}
            onChange={(v) => {
              setCategory(v);
              setActive(null);
            }}
          />
        }
      />
      <div className="px-5 pt-3 sm:px-6">
        <SegmentedTabs
          id="donut-mode"
          size="sm"
          items={[
            { value: "disease", label: "ตามกลุ่มโรค" },
            { value: "sex", label: "ตามเพศ" },
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v);
            setActive(null);
          }}
        />
      </div>

      <div className="grid gap-4 px-5 pb-6 pt-2 sm:grid-cols-[220px_minmax(0,1fr)] sm:px-6">
        <Loadable
          ready={ready}
          skeleton={
            <div className="grid h-[220px] place-items-center">
              <Skeleton className="size-[190px] rounded-full" />
            </div>
          }
        >
          <div className="relative h-[220px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${category}-${mode}-${year}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: DUR.base, ease: EASE_OUT }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      cornerRadius={6}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      isAnimationActive
                      animationDuration={CHART_MS.radial}
                      animationEasing="ease-out"
                      onMouseEnter={(_, i) => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                    >
                      {slices.map((s, i) => (
                        <Cell
                          key={s.name}
                          fill={s.color}
                          fillOpacity={active === null || active === i ? 1 : 0.35}
                          style={{ transition: "fill-opacity 200ms ease-out", outline: "none" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip labelFrom="name" />} animationDuration={180} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-[11px] text-mis-muted">{focus ? "สัดส่วน" : "รวมทั้งหมด"}</p>
                {focus ? (
                  <p className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums">{fmtPct((focus.value / total) * 100, false)}</p>
                ) : (
                  <CountUp value={total} className="text-[24px] font-semibold tracking-[-0.02em] tabular-nums" />
                )}
                <p className="text-[11px] text-mis-faint">ครั้ง</p>
              </div>
            </div>
          </div>
        </Loadable>

        <ul className="min-w-0 space-y-1 self-center">
          {slices.map((s, i) => {
            const pct = total ? (s.value / total) * 100 : 0;
            return (
              <li key={s.name}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-mis-ink/[0.035]"
                  title={s.name}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-mis-ink-2">{s.name}</span>
                  <span className="text-[12px] tabular-nums text-mis-muted">{fmtNum(s.value)}</span>
                  <span className="w-12 text-right text-[12px] font-semibold tabular-nums text-mis-ink">{pct.toFixed(1)}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}
