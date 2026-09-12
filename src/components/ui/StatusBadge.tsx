import { cn } from "@/lib/cn";
import type { DataNature, ProviderStatus } from "@/lib/providers/types";

const NATURE_LABEL: Record<DataNature, string> = {
  observado: "Observado",
  previsto: "Previsto",
  simulado: "Simulado",
  oficial: "Alerta oficial",
};

const NATURE_STYLE: Record<DataNature, string> = {
  observado:
    "bg-[color:var(--color-info-soft)] text-[color:var(--color-info)]",
  previsto:
    "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
  simulado:
    "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]",
  oficial:
    "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]",
};

/**
 * Diferencia visualmente OBSERVADO / PREVISTO / SIMULADO / ALERTA
 * OFICIAL. Nunca usar apenas cor: o texto do rótulo é sempre a
 * fonte de verdade, a cor é reforço.
 */
export function NatureBadge({ nature }: { nature: DataNature }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        NATURE_STYLE[nature]
      )}
    >
      {NATURE_LABEL[nature]}
    </span>
  );
}

const STATUS_LABEL: Record<ProviderStatus, string> = {
  ok: "Ao vivo",
  degradado: "Degradado",
  indisponivel: "Indisponível",
  stale: "Desatualizado",
};

const STATUS_DOT: Record<ProviderStatus, string> = {
  ok: "bg-[color:var(--color-success)]",
  degradado: "bg-[color:var(--color-warning)]",
  indisponivel: "bg-[color:var(--color-danger)]",
  stale: "bg-[color:var(--color-text-subtle)]",
};

export function StatusBadge({ status }: { status: ProviderStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
      <span
        className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])}
        aria-hidden
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
