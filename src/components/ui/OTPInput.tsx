"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function OTPInput({
  length = 4,
  onComplete,
  status = "idle",
}: {
  length?: number;
  onComplete?: (code: string) => void;
  status?: "idle" | "verifying" | "success" | "error";
}) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function updateAt(index: number, char: string) {
    const next = [...values];
    next[index] = char;
    setValues(next);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.every((v) => v !== "")) {
      onComplete?.(next.join(""));
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateAt(index, digit);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    e.preventDefault();
    const next = Array(length).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setValues(next);
    const lastIndex = Math.min(digits.length, length) - 1;
    refs.current[Math.max(lastIndex, 0)]?.focus();
    if (digits.length === length) onComplete?.(digits);
  }

  return (
    <div
      role="group"
      aria-label={`Código de verificação de ${length} dígitos`}
      className={cn(
        "flex gap-3",
        status === "error" && "animate-[shake_320ms_ease-in-out]"
      )}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${i + 1} de ${length}`}
          disabled={status === "verifying" || status === "success"}
          className={cn(
            "h-14 w-12 rounded-[var(--radius-md)] border text-center text-xl font-data text-[color:var(--color-text)] bg-[color:var(--color-surface)] transition-colors duration-[var(--duration-base)]",
            status === "error"
              ? "border-[color:var(--color-danger)]"
              : status === "success"
              ? "border-[color:var(--color-success)]"
              : "border-[color:var(--color-border)] focus:border-[color:var(--color-interactive)]"
          )}
        />
      ))}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}
