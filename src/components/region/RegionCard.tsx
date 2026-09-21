import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MapCard } from "@/components/map/MapCard";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { Sparkline } from "@/components/ui/Sparkline";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { AlertBanner } from "@/components/ui/Alert";
import {
  IconHumidity,
  IconRain,
  IconTrendDown,
  IconTrendFlat,
  IconTrendUp,
  IconWind,
} from "@/components/icons";
import type { Region } from "@/lib/data/regions";
import type { RegionSnapshot } from "@/lib/providers/types";
import { conditionLabel } from "@/lib/weather-labels";

const TREND_ICON = { subindo: IconTrendUp, descendo: IconTrendDown, estavel: IconTrendFlat, indefinido: IconTrendFlat };

export function RegionCard({ region, snapshot }: { region: Region; snapshot: RegionSnapshot }) {
  const { weather, river, alerts } = snapshot;
  const TrendIcon = TREND_ICON[weather.trend];

  return (
    <Card elevated interactive className="group flex flex-col overflow-hidden">
      <MapCard slug={region.slug} regionLabel={region.shortName} providerStatus={weather.provenance.status} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--color-text)]">
              {region.name}
            </h3>
            <p className="text-xs text-[color:var(--color-text-subtle)]">
              {conditionLabel(weather.condition)}
            </p>
          </div>
          <NatureBadge nature={weather.provenance.nature} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-data text-3xl text-[color:var(--color-text)]">
              {weather.temperatureC ?? "—"}
            </span>
            <span className="text-sm text-[color:var(--color-text-subtle)]">°C</span>
            <span className="ml-1 flex items-center text-[color:var(--color-text-subtle)]">
              <TrendIcon size={16} />
            </span>
          </div>
          <Sparkline
            points={snapshot.sparkline}
            ariaLabel={`Tendência de temperatura em ${region.shortName} nas últimas horas`}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <WeatherMetric icon={<IconRain size={16} />} label="Chuva 24h" value={weather.rain24hMm} unit="mm" />
          <WeatherMetric icon={<IconWind size={16} />} label="Vento" value={weather.windSpeedKmh} unit="km/h" />
          <WeatherMetric icon={<IconHumidity size={16} />} label="Umidade" value={weather.humidityPct} unit="%" />
        </div>

        {river && (
          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[color:var(--color-surface-sunken)] px-3 py-2 text-xs">
            <span className="text-[color:var(--color-text-muted)]">
              {river.riverName}: <span className="font-data text-[color:var(--color-text)]">{river.levelM?.toFixed(2)} m</span>
            </span>
            <span className="text-[color:var(--color-text-subtle)] capitalize">{river.levelTrend}</span>
          </div>
        )}

        {alerts.length > 0 && <AlertBanner alert={alerts[0]} />}

        <DataFreshness provenance={weather.provenance} />

        <Link
          href={`/cidade/${region.slug}`}
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-interactive)] transition-[gap,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:gap-2 hover:text-[color:var(--color-interactive-hover)] active:gap-1"
        >
          Ver detalhes de {region.shortName}
          <span aria-hidden className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </Card>
  );
}
