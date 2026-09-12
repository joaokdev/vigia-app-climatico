import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  elevated = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        elevated && "shadow-[var(--shadow-elevation-2)]",
        className
      )}
      {...rest}
    />
  );
}
