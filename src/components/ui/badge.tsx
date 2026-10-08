import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-5 tabular-nums",
  {
    variants: {
      tone: {
        neutral: "bg-mis-ink/5 text-mis-muted",
        accent: "bg-mis-accent-soft text-mis-accent-strong",
        up: "bg-mis-rose/10 text-mis-rose",
        down: "bg-emerald-500/10 text-emerald-700",
        amber: "bg-mis-amber/15 text-[#a8661a]",
        violet: "bg-mis-violet/10 text-mis-violet",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
