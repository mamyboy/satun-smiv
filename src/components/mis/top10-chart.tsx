"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { top10, SETTING_LABEL, type Setting, type Year } from "@/lib/mis/data";
import { fmtCompact, shortLabel } from "@/lib/mis/format";
import { ChartTooltip } from "./chart-tooltip";
import { ChartSkeleton, Loadable, Panel, PanelHeader } from "./panel";
import { SegmentedTabs } from "./segmented-tabs";
import { CHART_MS, DUR, EASE_OUT } from "./motion";

type Metric = "people" | "visits";

export function Top10Chart({ year, ready, index }: { year: Year; ready: boolean; index: number }) {
  const [setting, setSetting] = useState<Setting>("opd");
  const [metric, setMetric] = useState<Metric>("people");
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(
    () =>
      [...top10(setting, year)]
        .sort((a, b) => b[metric] - a[metric])
        .map((r) => ({ ...r, short: shortLabel(r.name, 28), value: r[metric] })),
    [setting, year, metric],
  );

  return (
    <Panel id="top10" index={index} className="xl:col-span-7">
      <PanelHeader
        icon={<BarChart3 />}
        title={`10 อันดับกลุ่มโรค — ${SETTING_LABEL[setting]} ปี ${year}`}
        description="วินิจฉัยหลัก · จัดกลุ่มตาม 298 กลุ่มโรค (ไม่รวม Z-code)"
        actions={
          <>
            <SegmentedTabs
              id="top10-setting"
              size="sm"
              items={[
                { value: "opd", label: "ผู้ป่วยนอก" },
                { value: "ipd", label: "ผู้ป่วยใน" },
              ]}
              value={setting}
              onChange={setSetting}
            />
            <SegmentedTabs
              id="top10-metric"
              size="sm"
              items={[
                { value: "people", label: "คน (ตัดซ้ำ)" },
                { value: "visits", label: "ครั้ง" },
              ]}
              value={metric}
              onChange={setMetric}
            />
          </>
        }
      />
      <div className="px-2 pb-4 pt-3 sm:px-4">
        <Loadable ready={ready} skeleton={<div className="px-3"><ChartSkeleton height={380} /></div>}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${setting}-${year}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="h-[380px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 4, bottom: 0 }}
                  barCategoryGap={7}
                  onMouseLeave={() => setHover(null)}
                >
                  <CartesianGrid horizontal={false} stroke="#e3ebef" strokeDasharray="4 6" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a6b0", fontSize: 11.5 }}
                    tickFormatter={(v: number) => fmtCompact(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="short"
                    width={196}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#1d3340", fontSize: 12 }}
                  />
                  <Tooltip
                    content={<ChartTooltip labelFrom="name" unit={metric === "people" ? "คน" : "ครั้ง"} />}
                    cursor={{ fill: "rgba(2,184,200,.06)", radius: 10 }}
                    animationDuration={180}
                  />
                  <Bar
                    dataKey="value"
                    name={metric === "people" ? "จำนวนคน (ตัดซ้ำ)" : "จำนวนครั้ง"}
                    radius={[0, 10, 10, 0]}
                    isAnimationActive
                    animationDuration={CHART_MS.grow}
                    animationEasing="ease-out"
                    onMouseEnter={(_, i) => setHover(i)}
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={d.name}
                        fill={i === 0 ? "#061923" : "#02b8c8"}
                        fillOpacity={hover === null || hover === i ? (i === 0 ? 1 : 0.92 - i * 0.045) : 0.3}
                        style={{ transition: "fill-opacity 200ms ease-out" }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </Loadable>
      </div>
    </Panel>
  );
}
