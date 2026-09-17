"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Variante mais larga do AuthShell — para o Split Panel Auth, que já
 * tem seu próprio card, cabeçalho e borda (diferente de /recuperar-acesso,
 * que ainda usa o AuthShell "estreito" original).
 */
export function SplitAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="auth-ambient-glow auth-ambient-glow--a" />
        <div className="auth-ambient-glow auth-ambient-glow--b" />
      </div>

      <Link href="/" aria-label="VIGIA — página inicial">
        <Logo size={56} />
      </Link>

      {children}

      <style jsx>{`
        .auth-ambient-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          opacity: 0.35;
        }
        .auth-ambient-glow--a {
          top: -10%;
          left: -8%;
          width: 55vw;
          height: 55vw;
          max-width: 480px;
          max-height: 480px;
          background: radial-gradient(circle, var(--data-rain-2), transparent 70%);
        }
        .auth-ambient-glow--b {
          bottom: -15%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          max-width: 420px;
          max-height: 420px;
          background: radial-gradient(circle, var(--color-accent), transparent 70%);
        }
        @media (prefers-reduced-transparency: reduce) {
          .auth-ambient-glow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
