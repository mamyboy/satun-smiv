"use client";

import { motion } from "motion/react";
import { fmtNum } from "@/lib/mis/format";
import { DUR, EASE_OUT } from "./motion";

interface Item {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
}

/** Shared Recharts tooltip: fades/scales in, sorted values, full (untruncated) labels. */
export function ChartTooltip({
  active,
  payload,
  label,
  labelPrefix = "พ.ศ. ",
  unit = "ครั้ง",
  labelFrom,
}: {
  active?: boolean;
  payload?: ReadonlyArray<Item>;
  label?: string | number;
  labelPrefix?: string;
  unit?: string;
  labelFrom?: string;
}) {
  if (!active || !payload?.length) return null;
  const heading = labelFrom ? String(payload[0]?.payload?.[labelFrom] ?? label) : `${labelPrefix}${label}`;
  const items = [...payload].sort((a, b) => Number(b.value) - Number(a.value));
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: DUR.fast, ease: EASE_OUT }}
      className="mis-glass max-w-[300px] rounded-2xl px-3.5 py-3 text-xs shadow-mis-hover"
    >
      <p className="mb-2 font-semibold leading-snug text-mis-ink">{heading}</p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={String(it.dataKey ?? it.name)} className="flex items-start gap-2">
            <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: it.color }} />
            <span className="flex-1 leading-snug text-mis-muted">{it.name}</span>
            <span className="font-semibold tabular-nums text-mis-ink">
              {fmtNum(Number(it.value))} <span className="font-normal text-mis-faint">{unit}</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
