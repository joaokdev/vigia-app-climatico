"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--color-interactive)] text-[color:var(--color-on-accent)] hover:bg-[color:var(--color-interactive-hover)] border border-transparent",
  secondary:
    "bg-transparent text-[color:var(--color-text)] border border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-elevated)]",
  ghost:
    "bg-transparent text-[color:var(--color-text-muted)] border border-transparent hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-elevated)]",
  danger:
    "bg-[color:var(--color-danger)] text-[color:var(--color-on-accent)] border border-transparent hover:brightness-95",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

/**
 * Botão padrão do VIGIA.
 * Contrato de estados: default, hover, focus-visible, active,
 * disabled, loading. Nunca depende de hover para ser operável —
 * toda ação essencial funciona por clique/tecla Enter/Espaço.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-[background-color,transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          variantClass[variant],
          sizeClass[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        )}
        {children}
      </button>
    );
  }
);
