"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-[color:var(--color-text)]">
          {label}
        </label>
        {description && (
          <p className="text-xs text-[color:var(--color-text-subtle)]">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-[var(--radius-full)] transition-[background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-95",
          checked
            ? "bg-[color:var(--color-interactive)] hover:bg-[color:var(--color-interactive-hover)]"
            : "bg-[color:var(--color-border-strong)] hover:bg-[color:var(--color-text-subtle)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-on-accent)] shadow-[var(--shadow-elevation-1)] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
