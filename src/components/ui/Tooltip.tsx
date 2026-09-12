"use client";

import { useId, useState } from "react";

/**
 * Tooltip complementar, nunca portador único de informação crítica
 * (a informação essencial já está visível no texto/label ao redor).
 */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[color:var(--color-text)] px-2 py-1 text-xs text-[color:var(--color-background)] transition-opacity duration-[var(--duration-fast)]"
        style={{ opacity: open ? 1 : 0 }}
      >
        {label}
      </span>
    </span>
  );
}
