import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      {/* Fundo climático — sutil, decorativo, sem interferir no formulário.
          Usa os mesmos tokens de dado científico do resto do produto para
          que autenticação pareça parte do VIGIA, não uma tela genérica. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="auth-ambient-glow auth-ambient-glow--a" />
        <div className="auth-ambient-glow auth-ambient-glow--b" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo reduzida de 76 -> 64px: no desktop ainda tem presença de
            marca clara; no Android (360–412px) 76px, somado a título +
            subtítulo + card, empurrava o formulário para muito abaixo da
            dobra. 64px mantém reconhecimento imediato sem "comer" a
            altura útil da tela. */}
        <div className="mb-6 flex flex-col items-center gap-4 text-center sm:mb-9 sm:gap-5">
          <Link href="/" aria-label="VIGIA — página inicial">
            <Logo size={64} />
          </Link>
          <div>
            <h1 className="text-heading text-[color:var(--color-text)]">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[color:var(--color-text-muted)]">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-elevation-2)] sm:p-8">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>

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
