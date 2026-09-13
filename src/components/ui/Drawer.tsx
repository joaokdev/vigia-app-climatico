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
    // Trava o scroll do body enquanto o Drawer está aberto — sem isso,
    // no Android o conteúdo por trás rolava junto com o próprio Drawer
    // (dois scrolls competindo), o que é justamente a sensação de
    // "site quebrado" que a revisão mobile pediu para eliminar.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)]">
      <div
        className="absolute inset-0 animate-[drawer-fade-in_var(--duration-base)_var(--ease-standard)]"
        style={{ background: "var(--color-overlay)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 flex h-full w-[85vw] max-w-xs flex-col overflow-y-auto border-l border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-[var(--shadow-elevation-3)] animate-[slide-in_var(--duration-base)_var(--ease-emphasized)]"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[color:var(--color-text)]">{title}</h2>
          <IconButton label="Fechar menu" onClick={onClose}>
            <IconClose size={18} />
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
        @keyframes drawer-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
