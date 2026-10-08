import type { Transition, Variants } from "motion/react";

/** Motion design tokens — keep UI transitions within 180–350ms, no overshoot. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.18, base: 0.26, slow: 0.35 } as const;
export const SPRING: Transition = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 };
export const CHART_MS = { draw: 900, grow: 700, radial: 850, update: 450 } as const;

export const pageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
};

export const fadeSwap = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
  exit: { opacity: 0, y: -4, transition: { duration: DUR.fast, ease: EASE_OUT } },
} as const;

/** Hover elevation for cards. */
export const cardHover = {
  whileHover: { y: -3, boxShadow: "var(--mis-shadow-hover)" },
  transition: { duration: DUR.base, ease: EASE_OUT },
} as const;

/** Categorical palette (ocean family + semantic accents), ordered for max separation. */
export const SERIES_COLORS = ["#02b8c8", "#061923", "#7a6ff0", "#f2a541", "#e5616f", "#3fbf9f", "#5b8def", "#9aa9b2"];
