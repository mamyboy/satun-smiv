"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DUR, EASE_OUT } from "./motion";

/**
 * Bento card: scroll-triggered reveal (staggered by `index` above the fold),
 * subtle hover elevation, optional glass surface.
 */
export function Panel({
  id,
  index = 0,
  glass = false,
  className,
  children,
}: {
  id?: string;
  index?: number;
  glass?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -2, boxShadow: "var(--mis-shadow-hover)" }}
      className={cn(
        "relative min-w-0 scroll-mt-24 rounded-mis-lg shadow-mis",
        glass
          ? "mis-glass"
          : "border border-mis-line/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfe_100%)]",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function PanelHeader({
  title,
  description,
  icon,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mis-accent-soft text-mis-accent-strong [&_svg]:size-[18px]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-mis-ink">{title}</h2>
          {description && <p className="mt-0.5 text-[12.5px] leading-relaxed text-mis-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Skeleton → content cross-fade. */
export function Loadable({
  ready,
  skeleton,
  children,
  contentKey = "content",
}: {
  ready: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  contentKey?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {ready ? (
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: DUR.fast } }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div key="skeleton" exit={{ opacity: 0, transition: { duration: DUR.fast } }}>
          {skeleton}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="flex items-end gap-3 px-1" style={{ height }}>
      {[42, 68, 55, 80, 62, 90, 74].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-xl rounded-b-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
