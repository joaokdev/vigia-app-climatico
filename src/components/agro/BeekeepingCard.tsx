import { Card } from "@/components/ui/Card";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { IconHumidity, IconTemperature, IconWind } from "@/components/icons";
import { cn } from "@/lib/cn";
import { evaluateForagingCondition, FORAGING_LABEL } from "@/lib/agro";
import type { RegionSnapshot } from "@/lib/providers/types";

const STATUS_CLASS = {
  favoravel: "text-[color:var(--color-success)]",
  parcial: "text-[color:var(--color-warning)]",
  desfavoravel: "text-[color:var(--color-danger)]",
  indefinido: "text-[color:var(--color-text-subtle)]",
} as const;

/**
 * ATUALIZACAO_DO_VIGIA.md §16 — reaproveita o MESMO snapshot da
 * página (sem nova chamada de rede) e a heurística já existente em
 * `lib/agro.ts` (mesma usada pela página global /agro) para avaliar a
 * atividade das abelhas.
 */
export function BeekeepingCard({ snapshot }: { snapshot: RegionSnapshot }) {
  const foraging = evaluateForagingCondition(snapshot.weather);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[color:var(--color-text)]">Apicultura</h3>
        <span className={cn("text-xs font-medium", STATUS_CLASS[foraging.condition])}>
          {FORAGING_LABEL[foraging.condition]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 border-y border-[color:var(--color-border)] py-3">
        <WeatherMetric icon={<IconTemperature size={16} />} label="Temp." value={snapshot.weather.temperatureC} unit="°C" />
        <WeatherMetric icon={<IconWind size={16} />} label="Vento" value={snapshot.weather.windSpeedKmh} unit="km/h" />
        <WeatherMetric icon={<IconHumidity size={16} />} label="Umidade" value={snapshot.weather.humidityPct} unit="%" />
      </div>

      <ul className="flex flex-col gap-1 text-sm text-[color:var(--color-text-muted)]">
        {foraging.reasons.map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
    </Card>
  );
}
