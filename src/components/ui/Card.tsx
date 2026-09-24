import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  elevated = false,
  interactive = false,
  glass = false,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean; interactive?: boolean; glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        elevated && "shadow-[var(--shadow-elevation-2)]",
        interactive &&
          "hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:shadow-[var(--shadow-elevation-3)]",
        // Material translucente (ver skill apple-design §12): usada sobre o
        // WeatherBackground, nunca empilhada sobre outra superfície translúcida.
        glass &&
          "border-white/15 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl motion-reduce:backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-white/80",
        className
      )}
      {...rest}
    />
  );
}
