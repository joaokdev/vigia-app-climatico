"use client";

import { useState } from "react";
import { IconRiver, IconStation, IconTrendDown, IconTrendFlat, IconTrendUp } from "@/components/icons";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { Sparkline } from "@/components/ui/Sparkline";
import { RippleButton } from "@/components/effects/ripple-button/RippleButton";
import type { RiverSnapshot, StationInfo, Trend } from "@/lib/providers/types";
import { cn } from "@/lib/cn";

const TREND_ICON: Record<Trend, React.ComponentType<{ size?: number; className?: string }>> = {
  subindo: IconTrendUp,
  descendo: IconTrendDown,
  estavel: IconTrendFlat,
  indefinido: IconTrendFlat,
};

const ATTENTION_LABEL: Record<RiverSnapshot["vigiaAttentionLevel"], string> = {
  normal: "Normal",
  observacao: "Indicador VIGIA — observação",
  atencao: "Indicador VIGIA — atenção",
  critico: "Indicador VIGIA — crítico",
};

const ATTENTION_STYLE: Record<RiverSnapshot["vigiaAttentionLevel"], string> = {
  normal: "text-[color:var(--color-text-muted)]",
  observacao: "text-[color:var(--color-info)]",
  atencao: "text-[color:var(--color-warning)]",
  critico: "text-[color:var(--color-danger)]",
};

/** Nível 2 da hierarquia de informação: "por que isso importa?" —
 * uma frase curta de contexto, não apenas o número cru. */
const ATTENTION_CONTEXT: Record<RiverSnapshot["vigiaAttentionLevel"], string> = {
  normal: "Nível dentro da faixa típica para esta época do ano; sem necessidade de atenção adicional.",
  observacao:
    "Nível subindo de forma consistente nas últimas horas. Ainda distante da cota de transbordamento, mas vale acompanhar o histórico abaixo.",
  atencao:
    "Nível se aproxima de faixas historicamente associadas a alagamentos em pontos baixos da região.",
  critico:
    "Nível em faixa crítica. Siga as orientações da Defesa Civil e alertas oficiais, não apenas este indicador.",
};

export function RiverStatus({ river }: { river: RiverSnapshot }) {
  const [showHistory, setShowHistory] = useState(false);
  const TrendIcon = TREND_ICON[river.levelTrend];

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[color:var(--color-text)]">
          <IconRiver size={18} />
          <span className="font-medium">{river.riverName}</span>
        </div>
        <NatureBadge nature={river.provenance.nature} />
      </div>
      <div className="flex items-end gap-6">
        <div>
          <p className="font-data text-2xl text-[color:var(--color-text)]">
            {river.levelM !== null ? `${river.levelM.toFixed(2)} m` : "—"}
          </p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">Nível da régua</p>
        </div>
        {river.flowM3s !== null && (
          <div>
            <p className="font-data text-lg text-[color:var(--color-text)]">
              {river.flowM3s} m³/s
            </p>
            <p className="text-xs text-[color:var(--color-text-subtle)]">Vazão estimada</p>
          </div>
        )}
        <div className="flex items-center gap-1 text-sm">
          <TrendIcon size={16} />
          <span className="capitalize">{river.levelTrend}</span>
        </div>
      </div>

      <div>
        <p className={cn("text-xs font-medium", ATTENTION_STYLE[river.vigiaAttentionLevel])}>
          {ATTENTION_LABEL[river.vigiaAttentionLevel]}
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          {ATTENTION_CONTEXT[river.vigiaAttentionLevel]}
        </p>
      </div>

      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Este indicador é uma análise interna do VIGIA, não um alerta oficial de defesa civil.
      </p>

      <div className="flex items-center gap-3">
        <div className="scale-[0.62] origin-left -my-3">
          <RippleButton onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Ocultar histórico" : "Ver histórico (7 dias)"}
          </RippleButton>
        </div>
      </div>

      {showHistory && (
        <div className="rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-[color:var(--color-text-subtle)]">
              Nível — últimos 7 dias
            </p>
            <p className="font-data text-xs text-[color:var(--color-text-subtle)]">
              {river.history7d[0]?.v?.toFixed(2)} m → {river.history7d[river.history7d.length - 1]?.v?.toFixed(2)} m
            </p>
          </div>
          <Sparkline
            points={river.history7d}
            width={280}
            height={56}
            ariaLabel={`Histórico de nível do ${river.riverName} nos últimos 7 dias`}
          />
        </div>
      )}

      <DataFreshness provenance={river.provenance} />
    </div>
  );
}

export function StationCard({ station }: { station: StationInfo }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <IconStation size={17} className="text-[color:var(--color-text-subtle)]" />
        <div>
          <p className="text-sm text-[color:var(--color-text)]">{station.name}</p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">{station.network}</p>
        </div>
      </div>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          station.status === "ok" && "bg-[color:var(--color-success)]",
          station.status === "degradado" && "bg-[color:var(--color-warning)]",
          (station.status === "indisponivel" || station.status === "stale") &&
            "bg-[color:var(--color-text-subtle)]"
        )}
        aria-hidden
      />
    </div>
  );
}
