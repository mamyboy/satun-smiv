"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING } from "./motion";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

/** Segmented tabs with a shared-layout animated indicator. */
export function SegmentedTabs<T extends string>({
  id,
  items,
  value,
  onChange,
  size = "md",
  className,
}: {
  id: string;
  items: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("mis-scroll inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-mis-ink/[0.045] p-1", className)}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cn(
              "relative shrink-0 rounded-full font-medium transition-colors duration-200",
              size === "sm" ? "h-7 px-3 text-[11.5px]" : "h-8 px-3.5 text-[12.5px]",
              active ? "text-mis-ink" : "text-mis-muted hover:text-mis-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-indicator-${id}`}
                transition={SPRING}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(6,25,35,.08),0_4px_12px_-4px_rgba(6,25,35,.12)]"
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
