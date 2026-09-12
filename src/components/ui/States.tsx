import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconAlert, IconOffline } from "@/components/icons";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)]",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border)] p-6 text-left">
      <p className="text-sm font-medium text-[color:var(--color-text)]">{title}</p>
      {description && (
        <p className="text-sm text-[color:var(--color-text-muted)]">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar este dado",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] p-4 text-left"
    >
      <div className="flex items-center gap-2 text-[color:var(--color-danger)]">
        <IconAlert size={18} />
        <p className="text-sm font-medium">{title}</p>
      </div>
      {description && (
        <p className="text-sm text-[color:var(--color-text-muted)]">{description}</p>
      )}
      {action}
    </div>
  );
}

export function OfflineState({
  description = "Sem conexão com a rede. Mostrando o último dado disponível.",
}: {
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)] px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
      <IconOffline size={15} />
      <span>{description}</span>
    </div>
  );
}
