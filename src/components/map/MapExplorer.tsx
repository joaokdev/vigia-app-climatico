"use client";

import { useState } from "react";
import { MapCard } from "@/components/map/MapCard";
import { Card } from "@/components/ui/Card";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { IconHumidity, IconRain, IconWind } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { Region } from "@/lib/data/regions";
import type { RegionSnapshot } from "@/lib/providers/types";

const LEGEND = [
  { color: "var(--data-rain-1)", label: "Chuva fraca" },
  { color: "var(--data-rain-2)", label: "Chuva moderada" },
  { color: "var(--data-rain-3)", label: "Chuva forte" },
  { color: "var(--data-rain-4)", label: "Chuva intensa" },
];

export function MapExplorer({
  items,
}: {
  items: { region: Region; snapshot: RegionSnapshot }[];
}) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.region.slug);
  const active = items.find((i) => i.region.slug === activeSlug) ?? items[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-eyebrow text-[color:var(--color-text-subtle)]">
          Selecione uma região para analisar
        </p>
        <div role="tablist" aria-label="Selecionar região" className="flex flex-wrap gap-2">
          {items.map(({ region }) => {
            const isActive = region.slug === activeSlug;
            return (
              <button
                key={region.slug}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSlug(region.slug)}
                className={cn(
                  "rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-95",
                  isActive
                    ? "border-[color:var(--color-interactive)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]"
                )}
              >
                {region.shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="flex flex-col gap-2">
          <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-elevation-2)]">
            <MapCard
              key={active.region.slug}
              slug={active.region.slug}
              regionLabel={active.region.shortName}
              providerStatus={active.snapshot.weather.provenance.status}
            />
          </div>
          <p className="text-xs text-[color:var(--color-text-subtle)]">
            Ilustração esquemática demonstrativa — mapa com dados geoespaciais
            reais chega na FASE 2.
          </p>
        </div>

        <Card elevated className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-eyebrow text-[color:var(--color-text-subtle)]">
                Região selecionada
              </p>
              <h2 className="text-base font-semibold text-[color:var(--color-text)]">
                {active.region.name}
              </h2>
            </div>
            <NatureBadge nature={active.snapshot.weather.provenance.nature} />
          </div>

          <div className="grid grid-cols-3 gap-3 border-y border-[color:var(--color-border)] py-4">
            <WeatherMetric icon={<IconRain size={16} />} label="Chuva 24h" value={active.snapshot.weather.rain24hMm} unit="mm" />
            <WeatherMetric icon={<IconWind size={16} />} label="Vento" value={active.snapshot.weather.windSpeedKmh} unit="km/h" />
            <WeatherMetric icon={<IconHumidity size={16} />} label="Umidade" value={active.snapshot.weather.humidityPct} unit="%" />
          </div>

          <DataFreshness provenance={active.snapshot.weather.provenance} />

          <div>
            <p className="mb-2 text-xs font-medium text-[color:var(--color-text-subtle)]">
              Intensidade de chuva (demonstrativa)
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {LEGEND.map((l) => (
                <li key={l.label} className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)]">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} aria-hidden />
                  {l.label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
