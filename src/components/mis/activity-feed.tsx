"use client";

import { motion } from "motion/react";
import { Database, FileSpreadsheet, History, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { META } from "@/lib/mis/data";
import { Panel, PanelHeader } from "./panel";
import { DUR, EASE_OUT } from "./motion";
import { thaiDate } from "./sidebar";

interface Activity {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "accent" | "ink" | "violet" | "amber";
  title: string;
  detail: string;
  date: string;
}

/**
 * Data-pipeline activity log. Entries describe the actual extraction & publishing steps
 * behind this dashboard — extend by appending events as the pipeline grows.
 */
const ACTIVITY: Activity[] = [
  {
    id: "ncd-sheet",
    icon: FileSpreadsheet,
    tone: "violet",
    title: "เผยแพร่ตาราง “โรคไม่ติดต่อ”",
    detail: "8 กลุ่มโรค NCD · แยกเพศ · ผู้ป่วยนอก/ใน · Google Sheets",
    date: "2026-10-08",
  },
  {
    id: "com-sheet",
    icon: FileSpreadsheet,
    tone: "accent",
    title: "เผยแพร่ตาราง “โรคติดต่อ”",
    detail: "ICD-10 A00–B99 · แยกเพศ · 307 แถว",
    date: "2026-10-07",
  },
  {
    id: "top10",
    icon: FileSpreadsheet,
    tone: "ink",
    title: "ปรับปรุง TOP 10 ผู้ป่วยนอก/ใน",
    detail: "เปลี่ยนเป็น 2 ตัวชี้วัด: จำนวนคน (ตัดซ้ำ CID) และจำนวนครั้ง",
    date: "2026-10-07",
  },
  {
    id: "rule",
    icon: ShieldCheck,
    tone: "amber",
    title: "ปรับเกณฑ์การนับ",
    detail: "ยกเลิกกรอง TYPEAREA · คงเงื่อนไขสัญชาติไทยและยังไม่จำหน่าย",
    date: "2026-10-07",
  },
  {
    id: "extract",
    icon: Database,
    tone: "ink",
    title: "ดึงข้อมูลจาก HDC (DuckDB)",
    detail: "diagnosis_opd / diagnosis_ipd ⨝ person · ปีงบ 2566–2569",
    date: META.extractedDate,
  },
  {
    id: "hdc",
    icon: RefreshCw,
    tone: "accent",
    title: "HDC ประมวลผลข้อมูล 43 แฟ้ม",
    detail: "จังหวัดสตูล (91) · รอบประมวลผลล่าสุด",
    date: META.hdcProcessedDate,
  },
];

const TONE: Record<Activity["tone"], string> = {
  accent: "bg-mis-accent-soft text-mis-accent-strong",
  ink: "bg-mis-ink/[0.06] text-mis-ink",
  violet: "bg-mis-violet/10 text-mis-violet",
  amber: "bg-mis-amber/15 text-[#a8661a]",
};

export function ActivityFeed({ index }: { index: number }) {
  return (
    <Panel index={index} className="xl:col-span-4">
      <PanelHeader icon={<History />} title="ความเคลื่อนไหวของข้อมูล" description="บันทึกการดึง ประมวลผล และเผยแพร่" />
      <ol className="relative px-5 pb-6 pt-4 sm:px-6">
        <span aria-hidden className="absolute bottom-8 left-[39px] top-6 w-px bg-mis-line sm:left-[43px]" />
        {ACTIVITY.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: DUR.base, ease: EASE_OUT, delay: i * 0.05 }}
              className="relative flex gap-3 py-2.5"
            >
              <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-white", TONE[a.tone])}>
                <Icon className="size-[15px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13px] font-medium text-mis-ink">{a.title}</p>
                  <time dateTime={a.date} className="shrink-0 text-[11px] tabular-nums text-mis-faint">
                    {thaiDate(a.date)}
                  </time>
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-mis-muted">{a.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Panel>
  );
}
