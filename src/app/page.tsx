import { cookies } from "next/headers";
import { REGIONS, type RegionSlug } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { AlertCard } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { CONDITION_ICON, conditionLabel } from "@/lib/weather-labels";
import { getHeroSummary } from "@/lib/weather-insights";
import { isDaytime } from "@/lib/weather-visual";
import { CityCards, type CityCardData } from "@/components/home/CitySwitcher";
import { CityWelcome, CITY_COOKIE } from "@/components/home/CityWelcome";
import { WeatherBackground } from "@/components/home/WeatherBackground";
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
 * institucional completa, preservada). Na primeira visita (sem
 * cookie de cidade e sem `?cidade=` na URL) mostra a tela de entrada
 * "Olá 👋" (CityWelcome); depois disso, foco numa cidade por vez —
 * hero + timeline horária + insights práticos derivados dos mesmos
 * dados já normalizados (nunca dado inventado — ver weather-insights.ts).
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const savedSlug = cookieStore.get(CITY_COOKIE)?.value;

  const snapshots = await Promise.all(
    REGIONS.map(async (r) => ({ region: r, snapshot: await getRegionSnapshot(r.slug) }))
  );

  const cityCards: CityCardData[] = snapshots.map(({ region: r, snapshot: s }) => ({
    slug: r.slug,
    shortName: r.shortName,
    temperatureC: s.weather.temperatureC,
    condition: s.weather.condition,
    isDay: isDaytime(s.forecast[0]?.sunrise ?? null, s.forecast[0]?.sunset ?? null),
  }));

  const hasChosenCity = isRegionSlug(params.cidade) || isRegionSlug(savedSlug);
  if (!hasChosenCity) {
    return <CityWelcome cities={cityCards} />;
  }

  const slug = isRegionSlug(params.cidade) ? params.cidade : (savedSlug as RegionSlug);
  const region = REGIONS.find((r) => r.slug === slug) ?? REGIONS[0];
  const current = snapshots.find((s) => s.region.slug === region.slug)!;
  const { weather, forecast, alerts } = current.snapshot;
  const today = forecast[0];
  const cardForRegion = cityCards.find((c) => c.slug === region.slug);

  const Icon = weather.condition ? CONDITION_ICON[weather.condition] : IconRain;
  const dateLabel = DATE_FORMATTER.format(new Date());

  return (
    <>
      <WeatherBackground condition={weather.condition} isDay={cardForRegion?.isDay ?? true} />
      <div className="vigia-container flex max-w-3xl flex-col gap-8 py-8">
        <CityCards cities={cityCards} activeSlug={region.slug} />

        {/* Hero do dia — direto sobre o WeatherBackground, texto claro sempre */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm capitalize text-white/80 drop-shadow">
              {dateLabel} · {region.shortName}
            </p>
            <NatureBadge nature={weather.provenance.nature} />
          </div>
          <h1 className="text-display text-white drop-shadow" style={{ letterSpacing: "-0.02em" }}>
            Hoje em {region.shortName}
          </h1>
          <div className="flex items-center gap-4">
            <Icon size={48} className="text-white drop-shadow" />
            <div className="flex items-baseline gap-2">
              <span className="font-data text-6xl leading-none text-white drop-shadow">
                {weather.temperatureC ?? "—"}°
              </span>
              <span className="text-sm text-white/80 drop-shadow">
                {conditionLabel(weather.condition)}
                {weather.feelsLikeC !== null ? ` · sensação de ${weather.feelsLikeC}°` : ""}
              </span>
            </div>
          </div>
          {today ? (
            <p className="text-lg text-white/95 drop-shadow">{getHeroSummary(today)}</p>
          ) : null}
        </section>

        {/* Alertas oficiais da cidade selecionada — nunca escondidos atrás da experiência pessoal */}
        {alerts.length > 0 && (
          <Card glass className="flex flex-col gap-2 p-4">
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
              <h2 className="text-heading text-white drop-shadow">Seu dia</h2>
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
          <p className="text-sm text-white/70">
            Previsão detalhada de hoje indisponível no momento — não informado.
          </p>
        )}
      </div>
    </>
  );
}
