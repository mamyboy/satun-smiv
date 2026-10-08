"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarRange, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LAST_YEAR, YEARS, type Year, type YearRange } from "@/lib/mis/data";
import { DUR, EASE_OUT } from "./motion";

export const RANGE_PRESETS: { label: string; years: number }[] = [
  { label: "ทั้งหมด (4 ปี)", years: 4 },
  { label: "3 ปีล่าสุด", years: 3 },
  { label: "2 ปีล่าสุด", years: 2 },
  { label: "ปีล่าสุด", years: 1 },
];

export function presetRange(years: number): YearRange {
  const end = LAST_YEAR;
  const start = Math.max(YEARS[0], end - years + 1) as Year;
  return { start, end };
}

export function YearRangePicker({ value, onChange }: { value: YearRange; onChange: (r: YearRange) => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Year | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (y: Year) => {
    if (anchor === null) {
      setAnchor(y);
      onChange({ start: y, end: y });
    } else {
      onChange({ start: Math.min(anchor, y) as Year, end: Math.max(anchor, y) as Year });
      setAnchor(null);
      setOpen(false);
    }
  };

  const label = value.start === value.end ? `พ.ศ. ${value.end}` : `พ.ศ. ${value.start} – ${value.end}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setAnchor(null);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-10 items-center gap-2 rounded-full border border-mis-line bg-white px-3.5 text-[13px] font-medium text-mis-ink shadow-[0_1px_2px_rgba(6,25,35,.04)] transition-colors hover:bg-mis-surface-2"
      >
        <CalendarRange className="size-4 text-mis-accent-strong" />
        <span className="tabular-nums">{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: DUR.base, ease: EASE_OUT }}>
          <ChevronDown className="size-3.5 text-mis-faint" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="เลือกช่วงปี"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
            className="absolute right-0 top-12 z-40 w-[300px] origin-top-right rounded-mis-md border border-mis-line bg-white p-3 shadow-mis-hover"
          >
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-mis-faint">ช่วงเวลาสำเร็จรูป</p>
            <ul className="space-y-0.5">
              {RANGE_PRESETS.map((p) => {
                const r = presetRange(p.years);
                const on = r.start === value.start && r.end === value.end;
                return (
                  <li key={p.label}>
                    <button
                      onClick={() => {
                        onChange(r);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-xl px-3 text-[13px] transition-colors",
                        on ? "bg-mis-accent-soft text-mis-accent-strong" : "text-mis-ink hover:bg-mis-ink/[0.04]",
                      )}
                    >
                      <span>{p.label}</span>
                      <span className="flex items-center gap-2 text-[11.5px] tabular-nums text-mis-muted">
                        {r.start === r.end ? r.end : `${r.start}–${r.end}`}
                        {on && <Check className="size-3.5 text-mis-accent-strong" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="my-3 h-px bg-mis-line" />
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-mis-faint">
              {anchor === null ? "กำหนดเอง · เลือกปีเริ่มต้น" : "เลือกปีสิ้นสุด"}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {YEARS.map((y) => {
                const inRange = y >= value.start && y <= value.end;
                const edge = y === value.start || y === value.end;
                return (
                  <button
                    key={y}
                    onClick={() => pick(y)}
                    className={cn(
                      "h-10 rounded-xl text-[13px] font-medium tabular-nums transition-colors duration-200",
                      edge
                        ? "bg-mis-ink text-white"
                        : inRange
                          ? "bg-mis-accent-soft text-mis-accent-strong"
                          : "text-mis-ink hover:bg-mis-ink/[0.05]",
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
