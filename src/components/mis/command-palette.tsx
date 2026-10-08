"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarRange, CornerDownLeft, HeartPulse, LayoutDashboard, Microscope, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { allDiseaseNames } from "@/lib/mis/data";
import { DUR, EASE_OUT } from "./motion";
import { RANGE_PRESETS } from "./year-range-picker";
import type { NavTarget } from "./sidebar";

export type Command =
  | { kind: "section"; target: NavTarget; label: string }
  | { kind: "preset"; years: number; label: string }
  | { kind: "disease"; name: string; category: "ncd" | "communicable"; label: string };

const SECTIONS: { target: NavTarget; label: string }[] = [
  { target: "overview", label: "ไปที่ภาพรวม KPI" },
  { target: "trend", label: "ไปที่แนวโน้มโรค" },
  { target: "top10", label: "ไปที่ 10 อันดับโรค" },
  { target: "table", label: "ไปที่ตารางข้อมูลโรค" },
  { target: "insights", label: "ไปที่ข้อเสนอแนะ" },
];

export function CommandPalette({
  open,
  onClose,
  onRun,
}: {
  open: boolean;
  onClose: () => void;
  onRun: (c: Command) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo<Command[]>(
    () => [
      ...SECTIONS.map((s) => ({ kind: "section" as const, ...s })),
      ...RANGE_PRESETS.map((p) => ({ kind: "preset" as const, years: p.years, label: `ช่วงปี: ${p.label}` })),
      ...allDiseaseNames().map((d) => ({ kind: "disease" as const, name: d.name, category: d.category, label: d.name })),
    ],
    [],
  );

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? all.filter((c) => c.label.toLowerCase().includes(s)) : all.filter((c) => c.kind !== "disease");
    return list.slice(0, 9);
  }, [q, all]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    onRun(c);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-mis-ink/25 px-4 pt-[12vh] backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-label="ค้นหาคำสั่ง"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
            className="w-full max-w-[560px] overflow-hidden rounded-mis-lg border border-mis-line bg-white shadow-[0_30px_80px_-20px_rgba(6,25,35,.35)]"
          >
            <div className="flex items-center gap-3 border-b border-mis-line px-4">
              <Search className="size-4 text-mis-faint" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdx((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdx((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    run(results[idx]);
                  } else if (e.key === "Escape") onClose();
                }}
                placeholder="ค้นหาโรค ส่วนของแดชบอร์ด หรือช่วงปี…"
                className="h-14 flex-1 bg-transparent text-[15px] text-mis-ink placeholder:text-mis-faint focus:outline-none"
              />
              <kbd className="rounded-md border border-mis-line px-1.5 py-0.5 text-[10.5px] text-mis-faint">ESC</kbd>
            </div>
            <ul className="mis-scroll max-h-[360px] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-mis-muted">ไม่พบผลลัพธ์สำหรับ “{q}”</li>}
              {results.map((c, i) => {
                const Icon =
                  c.kind === "section" ? LayoutDashboard : c.kind === "preset" ? CalendarRange : c.category === "ncd" ? HeartPulse : Microscope;
                const on = i === idx;
                return (
                  <li key={`${c.kind}:${c.label}`}>
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => run(c)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors",
                        on ? "text-mis-ink" : "text-mis-ink-2",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="mis-cmd-active"
                          transition={{ duration: DUR.fast, ease: EASE_OUT }}
                          className="absolute inset-0 rounded-xl bg-mis-accent-soft"
                        />
                      )}
                      <Icon className={cn("relative size-4 shrink-0", on ? "text-mis-accent-strong" : "text-mis-faint")} />
                      <span className="relative flex-1 truncate">{c.label}</span>
                      <span className="relative text-[11px] text-mis-faint">
                        {c.kind === "disease" ? (c.category === "ncd" ? "NCD" : "โรคติดต่อ") : c.kind === "preset" ? "ช่วงปี" : "นำทาง"}
                      </span>
                      {on && <CornerDownLeft className="relative size-3.5 text-mis-accent-strong" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
