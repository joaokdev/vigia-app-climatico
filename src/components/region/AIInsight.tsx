import { IconEye } from "@/components/icons";
import { getRegionInsight } from "@/server/ai/insight";
import type { RegionSnapshot } from "@/lib/providers/types";

/**
 * "VIGIA Intelligence" — geração real via NVIDIA (server/ai/insight.ts).
 * Sem chave configurada ou em falha, mostra um estado indisponível
 * explícito em vez de texto fixo fingindo ser gerado — a página
 * continua funcional (requisito da ATUALIZACAO_DO_VIGIA.md: "o
 * frontend continua funcional com IA indisponível").
 */
export async function AIInsight({
  regionSlug,
  regionLabel,
  snapshot,
}: {
  regionSlug: string;
  regionLabel: string;
  snapshot: RegionSnapshot;
}) {
  const insight = await getRegionInsight(regionSlug, regionLabel, snapshot);

  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-accent-soft)] p-4">
      <IconEye size={18} className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" />
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow text-[color:var(--color-accent)]">VIGIA Intelligence</p>
        {insight ? (
          <>
            <p className="text-sm text-[color:var(--color-text)]">{insight.text}</p>
            <p className="text-[11px] text-[color:var(--color-text-subtle)]">
              Interpretação gerada por IA ({insight.model}) a partir dos dados medidos e previstos
              acima — nunca uma medição em si.
            </p>
          </>
        ) : (
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Insight de IA indisponível no momento — não informado. Os dados meteorológicos acima
            continuam completos e não dependem desta camada.
          </p>
        )}
      </div>
    </div>
  );
}
