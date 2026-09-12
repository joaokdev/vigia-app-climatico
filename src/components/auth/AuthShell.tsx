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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" aria-label="VIGIA — página inicial">
            <Logo size={52} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[color:var(--color-text)]">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-elevation-2)]">
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
