import { CONDITION_ICON } from "@/lib/weather-labels";
import type { ForecastDay } from "@/lib/providers/types";
import { IconRain } from "@/components/icons";

const HOUR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/**
 * Faixa horizontal leve com as próximas horas — a peça que faltava
 * entre "agora" (hero) e "próximos dias" (ForecastStrip). Mostra só
 * o essencial por hora (ícone, hora, temperatura, chance de chuva)
 * para dar uma leitura rápida e dinâmica do dia, sem virar mais uma
 * tabela de métricas.
 */
export function HourlyGlance({
  today,
  now = new Date(),
}: {
  today: ForecastDay | undefined;
  now?: Date;
}) {
  if (!today || today.hourly.length === 0) return null;

  const upcoming = today.hourly.filter((h) => new Date(h.t).getTime() >= now.getTime()).slice(0, 8);
  if (upcoming.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-eyebrow text-[color:var(--color-text-subtle)]">Próximas horas</p>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {upcoming.map((h, i) => {
          const Icon = h.condition ? CONDITION_ICON[h.condition] : null;
          const rain = h.precipitationProbabilityPct;
          return (
            <div key={h.t} className="flex shrink-0 flex-col items-center gap-1.5 text-center">
              <span className="text-[11px] text-[color:var(--color-text-subtle)]">
                {i === 0 ? "Agora" : HOUR_FORMATTER.format(new Date(h.t))}
              </span>
              {Icon ? <Icon size={20} className="text-[color:var(--color-text-muted)]" /> : null}
              <span className="font-data text-sm text-[color:var(--color-text)]">
                {h.temperatureC ?? "—"}°
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-[color:var(--color-accent)]">
                {rain !== null && rain > 0 ? (
                  <>
                    <IconRain size={10} />
                    {rain}%
                  </>
                ) : (
                  <span className="text-[color:var(--color-text-subtle)]">—</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
