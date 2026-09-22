import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegionBySlug } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { MapCard } from "@/components/map/MapCard";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { Sparkline } from "@/components/ui/Sparkline";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { NatureBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { AlertBanner } from "@/components/ui/Alert";
import { RiverStatus, StationCard } from "@/components/ui/River";
import { AIInsight } from "@/components/region/AIInsight";
import { ForecastStrip } from "@/components/forecast/ForecastStrip";
import { HourlyGlance } from "@/components/forecast/HourlyGlance";
import { EmptyState } from "@/components/ui/States";
import { Card } from "@/components/ui/Card";
import { conditionLabel, CONDITION_ICON } from "@/lib/weather-labels";
import {
  IconHumidity,
  IconPressure,
  IconRain,
  IconWind,
  IconChevronRight,
} from "@/components/icons";

// Clima é dado ao vivo (Open-Meteo + cache Redis de 10 min) — pré-gerar
// esta página em build time (SSG) congelaria o clima no valor de quando
// o build rodou. A cache de verdade já é o Redis do service, então esta
// rota renderiza sob demanda a cada requisição.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return {};
  return {
    title: region.name,
    description: `Clima, chuva, vento e ${region.river ? "nível do " + region.river.name + " " : ""}em tempo real para ${region.name}.`,
  };
}

export default async function CidadePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const snapshot = await getRegionSnapshot(region.slug);
  const { weather, forecast, river, alerts, stations } = snapshot;

  return (
    <div className="vigia-container flex flex-col gap-8 py-8">
      <nav aria-label="Trilha de navegação" className="text-sm text-[color:var(--color-text-subtle)]">
        <Link href="/" className="hover:text-[color:var(--color-text)]">Painel</Link>
        <span className="mx-1.5" aria-hidden>/</span>
        <span className="text-[color:var(--color-text)]">{region.shortName}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-display text-[color:var(--color-text)]">
            {region.name}
          </h1>
          <StatusBadge status={weather.provenance.status} />
        </div>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-muted)]">{region.description}</p>
      </header>

      {alerts.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
          <MapCard slug={region.slug} regionLabel={region.shortName} providerStatus={weather.provenance.status} />
        </div>

        <Card className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {weather.condition && (() => {
                  const ConditionIcon = CONDITION_ICON[weather.condition];
                  return <ConditionIcon size={22} className="text-[color:var(--color-text-muted)]" />;
                })()}
                <span className="text-sm font-medium text-[color:var(--color-text-muted)]">
                  {conditionLabel(weather.condition)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-data text-[clamp(2.75rem,6vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-text)]">
                  {weather.temperatureC ?? "—"}
                </span>
                <span className="text-lg text-[color:var(--color-text-subtle)]">°C</span>
              </div>
            </div>
            <NatureBadge nature={weather.provenance.nature} />
          </div>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Sensação térmica de {weather.feelsLikeC ?? "—"}°C
            {forecast[0]?.precipitationProbabilityMaxPct != null && (
              <> · {forecast[0].precipitationProbabilityMaxPct}% de chance de chuva hoje</>
            )}
          </p>

          <HourlyGlance today={forecast[0]} />

          <div className="grid grid-cols-2 gap-4">
            <WeatherMetric icon={<IconRain size={16} />} label="Chuva últimas 24h" value={weather.rain24hMm} unit="mm" />
            <WeatherMetric icon={<IconWind size={16} />} label="Vento" value={weather.windSpeedKmh} unit="km/h" />
            <WeatherMetric icon={<IconHumidity size={16} />} label="Umidade relativa" value={weather.humidityPct} unit="%" />
            <WeatherMetric icon={<IconPressure size={16} />} label="Pressão" value={weather.pressureHpa} unit="hPa" />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[color:var(--color-text-subtle)]">
              Tendência — últimas 6 horas
            </p>
            <Sparkline
              points={snapshot.sparkline}
              width={260}
              height={48}
              ariaLabel={`Tendência de temperatura em ${region.shortName}`}
            />
          </div>

          <DataFreshness provenance={weather.provenance} />
        </Card>
      </div>

      <section aria-labelledby="previsao-heading" className="flex flex-col gap-3">
        <h2 id="previsao-heading" className="text-heading text-[color:var(--color-text)]">
          Previsão dos próximos dias
        </h2>
        <ForecastStrip forecast={forecast} regionLabel={region.shortName} />
      </section>

      <AIInsight regionSlug={region.slug} regionLabel={region.shortName} snapshot={snapshot} />

      <Link
        href={`/cidade/${region.slug}/agro`}
        className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-colors hover:bg-[color:var(--color-surface-elevated)]"
      >
        <div>
          <p className="text-eyebrow text-[color:var(--color-text-subtle)]">Nova área</p>
          <p className="text-base font-semibold text-[color:var(--color-text)]">Área do Agricultor</p>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            O que plantar agora, calendário agrícola, apicultura e lua e tradição.
          </p>
        </div>
        <IconChevronRight size={20} className="shrink-0 text-[color:var(--color-text-subtle)]" />
      </Link>

      {river ? (
        <section aria-labelledby="rio-heading" className="flex flex-col gap-3">
          <h2 id="rio-heading" className="text-heading text-[color:var(--color-text)]">
            Situação do rio
          </h2>
          <RiverStatus river={river} />
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading text-[color:var(--color-text)]">Situação do rio</h2>
          <EmptyState
            title="Nenhuma estação fluviométrica associada a esta região"
            description="Ainda não há régua ou estação de nível de rio mapeada para esta cidade."
          />
        </section>
      )}

      <section aria-labelledby="estacoes-heading" className="flex flex-col gap-3">
        <h2 id="estacoes-heading" className="text-heading text-[color:var(--color-text)]">
          Estações próximas
        </h2>
        {stations.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {stations.map((s) => (
              <StationCard key={s.id} station={s} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhuma estação disponível" description="Ainda não há estações cadastradas para esta região." />
        )}
      </section>
    </div>
  );
}
