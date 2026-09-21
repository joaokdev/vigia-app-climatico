"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { IconChevronDown, IconCheck, IconAlert } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { PlantingOpportunity } from "@/server/agro/plantio";

const STATUS_META: Record<
  PlantingOpportunity["status"],
  { label: string; className: string; icon: typeof IconCheck }
> = {
  favoravel: {
    label: "Janela favorável",
    className: "border-[color:var(--color-success)] bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]",
    icon: IconCheck,
  },
  atencao: {
    label: "Atenção",
    className: "border-[color:var(--color-warning)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]",
    icon: IconAlert,
  },
  "fora-de-epoca": {
    label: "Fora de época",
    className: "border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)] text-[color:var(--color-text-subtle)]",
    icon: IconAlert,
  },
};

/**
 * Estrutura pedida em ATUALIZACAO_DO_VIGIA.md §13: título de status +
 * cultura, motivos objetivos e um "ver detalhes" que expande o
 * porquê. Nunca linguagem de garantia agronômica.
 */
export function PlantingOpportunityCard({ opportunity }: { opportunity: PlantingOpportunity }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[opportunity.status];
  const Icon = meta.icon;

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-[var(--radius-full)] border px-2 py-0.5 text-[11px] font-medium",
              meta.className
            )}
          >
            <Icon size={12} />
            {meta.label}
          </span>
          <h3 className="mt-1.5 text-base font-semibold text-[color:var(--color-text)]">{opportunity.crop.name}</h3>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-elevated)]"
        >
          <IconChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
      </div>

      {expanded ? (
        <ul className="flex flex-col gap-1 border-t border-[color:var(--color-border)] pt-2 text-sm text-[color:var(--color-text-muted)]">
          {opportunity.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
