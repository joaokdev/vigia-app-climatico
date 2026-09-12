"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      style={{ background: "var(--color-overlay)" }}
      onClick={onClose}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-[var(--shadow-elevation-3)] outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[color:var(--color-text)]">{title}</h2>
          <IconButton label="Fechar" size="sm" onClick={onClose}>
            <IconClose size={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
