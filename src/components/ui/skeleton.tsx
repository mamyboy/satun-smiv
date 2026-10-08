import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        "relative overflow-hidden rounded-mis-sm bg-mis-ink/[0.05]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[mis-shimmer_1.4s_ease-in-out_infinite]",
        "after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)]",
        className,
      )}
    />
  );
}
