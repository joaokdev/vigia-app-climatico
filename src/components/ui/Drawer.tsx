"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";

export function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)]">
      <div
        className="absolute inset-0"
        style={{ background: "var(--color-overlay)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 h-full w-[85vw] max-w-xs border-l border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-[var(--shadow-elevation-3)] animate-[slide-in_var(--duration-base)_var(--ease-emphasized)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[color:var(--color-text)]">{title}</h2>
          <IconButton label="Fechar menu" size="sm" onClick={onClose}>
            <IconClose size={16} />
          </IconButton>
        </div>
        {children}
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
