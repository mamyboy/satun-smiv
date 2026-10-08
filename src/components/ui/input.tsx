import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-full border border-mis-line bg-mis-surface px-4 text-sm text-mis-ink placeholder:text-mis-faint",
        "transition-[border-color,box-shadow] duration-200 focus:border-mis-accent/60 focus:outline-none focus:ring-4 focus:ring-mis-accent/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
