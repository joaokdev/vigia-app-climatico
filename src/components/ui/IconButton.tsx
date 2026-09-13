"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Nome acessível obrigatório — ícone sozinho nunca é suficiente. */
  label: string;
  active?: boolean;
  size?: "sm" | "md";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, active = false, size = "md", className, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] border transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-90",
          size === "sm" ? "h-8 w-8" : "h-10 w-10",
          active
            ? "bg-[color:var(--color-accent-soft)] border-[color:var(--color-accent)] text-[color:var(--color-accent)]"
            : "bg-transparent border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
