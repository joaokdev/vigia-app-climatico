import { REGIONS, type RegionSlug } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { AlertCard } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { CONDITION_ICON, conditionLabel } from "@/lib/weather-labels";
import { getHeroSummary } from "@/lib/weather-insights";
import { isDaytime } from "@/lib/weather-visual";
import { CityCards, type CityCardData } from "@/components/home/CitySwitcher";
import { HourlyTimeline } from "@/components/home/HourlyTimeline";
import { GoNowCard, BestWindowCard, DaySummaryCard, DayEventsCard } from "@/components/home/TodayInsights";
import { IconRain } from "@/components/icons";

// Clima ao vivo (Redis já cuida do cache de verdade) — sem SSG aqui.
export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: "America/Sao_Paulo",
});

function isRegionSlug(value: string | undefined): value is RegionSlug {
  return REGIONS.some((r) => r.slug === value);
}

/**
 * Home pessoal do VIGIA — "Hoje". Substitui o antigo painel
 * multi-cidade como porta de entrada (ver /regioes para a visão
 * institucional completa, preservada). Foco numa cidade por vez:
 * hero + timeline horária + insights práticos derivados dos mesmos
 * dados já normalizados (nunca dado inventado — ver weather-insights.ts).
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const params = await searchParams;
  const slug = isRegionSlug(params.cidade) ? params.cidade : REGIONS[0].slug;
  const region = REGIONS.find((r) => r.slug === slug) ?? REGIONS[0];

  const snapshots = await Promise.all(
    REGIONS.map(async (r) => ({ region: r, snapshot: await getRegionSnapshot(r.slug) }))
  );
  const current = snapshots.find((s) => s.region.slug === region.slug)!;
  const { weather, forecast, alerts } = current.snapshot;
  const today = forecast[0];

  const cityCards: CityCardData[] = snapshots.map(({ region: r, snapshot: s }) => ({
    slug: r.slug,
    shortName: r.shortName,
    temperatureC: s.weather.temperatureC,
    condition: s.weather.condition,
    isDay: isDaytime(s.forecast[0]?.sunrise ?? null, s.forecast[0]?.sunset ?? null),
  }));

  const Icon = weather.condition ? CONDITION_ICON[weather.condition] : IconRain;
  const dateLabel = DATE_FORMATTER.format(new Date());

  return (
    <div className="vigia-container flex max-w-3xl flex-col gap-8 py-8">
      <CityCards cities={cityCards} activeSlug={region.slug} />

      {/* Hero do dia */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm capitalize text-[color:var(--color-text-subtle)]">
            {dateLabel} · {region.shortName}
          </p>
          <NatureBadge nature={weather.provenance.nature} />
        </div>
        <h1 className="text-display text-[color:var(--color-text)]">Hoje em {region.shortName}</h1>
        <div className="flex items-center gap-4">
          <Icon size={48} className="text-[color:var(--color-accent)]" />
          <div className="flex items-baseline gap-2">
            <span className="font-data text-5xl text-[color:var(--color-text)]">
              {weather.temperatureC ?? "—"}°
            </span>
            <span className="text-sm text-[color:var(--color-text-subtle)]">
              {conditionLabel(weather.condition)}
              {weather.feelsLikeC !== null ? ` · sensação de ${weather.feelsLikeC}°` : ""}
            </span>
          </div>
        </div>
        {today ? (
          <p className="text-lg text-[color:var(--color-text)]">{getHeroSummary(today)}</p>
        ) : null}
      </section>

      {/* Alertas oficiais da cidade selecionada — nunca escondidos atrás da experiência pessoal */}
      {alerts.length > 0 && (
        <Card className="flex flex-col gap-2 p-4">
          <ul>
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </ul>
        </Card>
      )}

      {today ? (
        <>
          {/* Seu dia — timeline horária */}
          <section className="flex flex-col gap-3">
            <h2 className="text-heading text-[color:var(--color-text)]">Seu dia</h2>
            <HourlyTimeline today={today} />
          </section>

          <GoNowCard weather={weather} today={today} />

          <div className="grid gap-4 sm:grid-cols-2">
            <BestWindowCard today={today} />
            <DaySummaryCard today={today} />
          </div>

          <DayEventsCard today={today} />
        </>
      ) : (
        <p className="text-sm text-[color:var(--color-text-subtle)]">
          Previsão detalhada de hoje indisponível no momento — não informado.
        </p>
      )}
    </div>
  );
}
