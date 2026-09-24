import { Card } from "@/components/ui/Card";
import { IconAlert, IconCheck, IconRain, IconSun, IconTemperature, IconWind, IconEye, IconMoon } from "@/components/icons";
import type { ForecastDay, WeatherSnapshot } from "@/lib/providers/types";
import {
  generateDayEvents,
  getBestWindow,
  getDaySummary,
  getGoNowAdvice,
  hourLabel,
  type WeatherEventKind,
} from "@/lib/weather-insights";
import { cn } from "@/lib/cn";

const EVENT_ICON: Record<WeatherEventKind, typeof IconRain> = {
  chuva: IconRain,
  "chuva-proxima": IconRain,
  "temp-max": IconTemperature,
  "temp-cai": IconTemperature,
  vento: IconWind,
  "janela-sol": IconSun,
  anoitecer: IconMoon,
  visibilidade: IconEye,
};

/** "Se você for sair agora" — o cartão mais acionável da página. */
export function GoNowCard({ weather, today }: { weather: WeatherSnapshot; today: ForecastDay }) {
  const advice = getGoNowAdvice(weather, today);
  const Icon = advice.tone === "atencao" ? IconAlert : IconCheck;

  return (
    <Card
      elevated
      className={cn(
        "flex flex-col gap-2 p-5",
        advice.tone === "atencao" && "border-[color:var(--color-warning)]",
        advice.tone === "tranquilo" && "border-[color:var(--color-success)]"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={18}
          className={cn(
            advice.tone === "atencao" && "text-[color:var(--color-warning)]",
            advice.tone === "tranquilo" && "text-[color:var(--color-success)]",
            advice.tone === "indefinido" && "text-[color:var(--color-text-subtle)]"
          )}
        />
        <h2 className="text-heading text-[color:var(--color-text)]">Se você for sair agora</h2>
      </div>
      <p className="font-data text-lg text-[color:var(--color-text)]">{advice.headline}</p>
      <p className="text-sm text-[color:var(--color-text-muted)]">{advice.detail}</p>
    </Card>
  );
}

/** "Melhor momento do dia" — maior janela sem chuva e com temperatura amena. */
export function BestWindowCard({ today }: { today: ForecastDay }) {
  const best = getBestWindow(today);

  return (
    <Card elevated className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2">
        <IconSun size={18} className="text-[color:var(--color-accent)]" />
        <h2 className="text-heading text-[color:var(--color-text)]">Melhor momento para sair</h2>
      </div>
      {best ? (
        <>
          <p className="font-data text-lg text-[color:var(--color-text)]">
            {hourLabel(best.startISO)} – {hourLabel(best.endISO)}
          </p>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Baixa chance de chuva{best.avgTempC !== null ? `, em torno de ${best.avgTempC}°` : ""}.
          </p>
        </>
      ) : (
        <p className="text-sm text-[color:var(--color-text-subtle)]">
          Não há uma janela clara sem chuva hoje — condições parecidas ao longo do dia.
        </p>
      )}
    </Card>
  );
}

/** Resumo por período — "Como será seu dia". */
export function DaySummaryCard({ today }: { today: ForecastDay }) {
  const blocks = getDaySummary(today);
  if (blocks.length === 0) return null;

  return (
    <Card elevated className="flex flex-col gap-4 p-5">
      <h2 className="text-heading text-[color:var(--color-text)]">Como será seu dia</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.label} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[color:var(--color-text-subtle)]">{b.label}</span>
            <span className="text-sm text-[color:var(--color-text)]">{b.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** "O que você precisa saber" — lista compacta de eventos do dia. */
export function DayEventsCard({ today }: { today: ForecastDay }) {
  const events = generateDayEvents(today);
  if (events.length === 0) return null;

  return (
    <Card elevated className="flex flex-col gap-3 p-5">
      <h2 className="text-heading text-[color:var(--color-text)]">O que você precisa saber</h2>
      <ul className="flex flex-col gap-2.5">
        {events.map((e) => {
          const Icon = EVENT_ICON[e.kind];
          return (
            <li key={e.id} className="flex items-center gap-2.5 text-sm">
              <Icon size={16} className="shrink-0 text-[color:var(--color-accent)]" />
              <span className="text-[color:var(--color-text)]">{e.title}</span>
              <span className="ml-auto text-xs text-[color:var(--color-text-subtle)]">{e.timeLabel}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
