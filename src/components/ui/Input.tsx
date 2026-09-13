"use client";

import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { IconEye, IconEyeOff } from "@/components/icons";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

/**
 * Campo de texto padrão. Label sempre visível (nunca apenas
 * placeholder), erro anunciado via aria-describedby + role="alert".
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[color:var(--color-text)]"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-describedby={cn(hint && hintId, error && errorId) || undefined}
        aria-invalid={!!error}
        className={cn(
          // 16px (text-base), não 15px: abaixo de 16px o Safari/Chrome no
          // iOS dá zoom automático ao focar o campo — no Android isso não
          // acontece, mas o valor precisa ser o mesmo em todo lugar.
          "h-12 rounded-[var(--radius-md)] border bg-[color:var(--color-surface)] px-3.5 text-base text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)] transition-colors duration-[var(--duration-fast)]",
          error
            ? "border-[color:var(--color-danger)]"
            : "border-[color:var(--color-border)] focus:border-[color:var(--color-interactive)]",
          className
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-[color:var(--color-text-subtle)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-[color:var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, InputProps>(
  function PasswordField({ label, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} label={label} type={visible ? "text" : "password"} {...rest} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          className="absolute right-3 top-[42px] text-[color:var(--color-text-subtle)] transition-[color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-[color:var(--color-text)] active:scale-90"
        >
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
    );
  }
);
