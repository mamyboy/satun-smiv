"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Eye, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInsights, type InsightTone } from "@/lib/mis/insights";
import type { YearRange } from "@/lib/mis/data";
import { Panel, PanelHeader } from "./panel";
import { DUR, EASE_OUT } from "./motion";

const TONES: Record<InsightTone, { icon: React.ComponentType<{ className?: string }>; label: string; chip: string; ring: string }> = {
  alert: { icon: AlertTriangle, label: "ต้องติดตาม", chip: "bg-mis-rose/12 text-mis-rose", ring: "before:bg-mis-rose" },
  watch: { icon: Eye, label: "เฝ้าระวัง", chip: "bg-mis-amber/15 text-[#a8661a]", ring: "before:bg-mis-amber" },
  positive: { icon: CheckCircle2, label: "แนวโน้มดี", chip: "bg-emerald-500/10 text-emerald-700", ring: "before:bg-emerald-500" },
  info: { icon: Info, label: "ข้อสังเกต", chip: "bg-mis-accent-soft text-mis-accent-strong", ring: "before:bg-mis-accent" },
};

export function InsightPanel({ range, index }: { range: YearRange; index: number }) {
  const insights = useMemo(() => buildInsights(range), [range]);

  return (
    <Panel id="insights" index={index} glass className="xl:col-span-5">
      <PanelHeader
        icon={<Sparkles />}
        title="ข้อค้นพบและข้อเสนอแนะ"
        description={`คำนวณอัตโนมัติจากข้อมูลช่วง พ.ศ. ${range.start}${range.start !== range.end ? `–${range.end}` : ""}`}
      />
      <div className="space-y-2.5 px-5 pb-6 pt-4 sm:px-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {insights.map((ins, i) => {
            const t = TONES[ins.tone];
            const Icon = t.icon;
            return (
              <motion.article
                layout
                key={`${ins.id}-${range.start}-${range.end}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT, delay: i * 0.04 } }}
                exit={{ opacity: 0, transition: { duration: DUR.fast } }}
                whileHover={{ x: 2 }}
                className={cn(
                  "relative overflow-hidden rounded-mis-md border border-white/90 bg-white/75 p-4 pl-5",
                  "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full",
                  t.ring,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", t.chip)}>
                    <Icon className="size-3" />
                    {t.label}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-mis-ink">{ins.metric}</span>
                </div>
                <h3 className="mt-2 text-[13.5px] font-semibold leading-snug text-mis-ink">{ins.title}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-mis-muted">{ins.body}</p>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {insights.length === 0 && <p className="py-6 text-center text-[13px] text-mis-muted">ไม่มีข้อค้นพบสำหรับช่วงนี้</p>}
      </div>
    </Panel>
  );
}
