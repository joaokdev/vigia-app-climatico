import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  elevated = false,
  interactive = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        elevated && "shadow-[var(--shadow-elevation-2)]",
        interactive &&
          "hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-elevation-3)]",
        className
      )}
      {...rest}
    />
  );
}
