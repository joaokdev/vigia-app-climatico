"use client";

import { useEffect, useRef, useState } from "react";
import type { ForecastDay, HourlyForecastPoint } from "@/lib/providers/types";
import { findCurrentHourIndex, hourLabel } from "@/lib/weather-insights";
import { CONDITION_ICON, conditionLabel } from "@/lib/weather-labels";
import { IconHumidity, IconRain, IconWind } from "@/components/icons";
import { cn } from "@/lib/cn";

function recommendationFor(hour: HourlyForecastPoint): string | null {
  const rain = hour.precipitationProbabilityPct ?? 0;
  if (rain >= 60) return "Leve guarda-chuva — chuva forte prevista para este horário.";
  if (rain >= 30) return "Chance de chuva — vale levar um guarda-chuva por precaução.";
  if (hour.windSpeedKmh !== null && hour.windSpeedKmh >= 30) return "Vento forte neste horário — cuidado em áreas abertas.";
  if (hour.temperatureC !== null && hour.temperatureC <= 12) return "Frio neste horário — vale um casaco mais quente.";
  return null;
}

/**
 * "Seu dia" — timeline horizontal do dia atual (Nível 2, versão
 * pessoal). A hora atual fica destacada e a lista já abre rolada até
 * ela (o usuário não precisa procurar). Clicar numa hora expande um
 * cartão com detalhe + recomendação prática — sem sair da timeline.
 */
export function HourlyTimeline({ today }: { today: ForecastDay }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const currentIndex = findCurrentHourIndex(today.hourly);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: "start", block: "nearest", behavior: "instant" as ScrollBehavior });
  }, [currentIndex]);

  if (today.hourly.length === 0) {
    return (
      <p className="text-sm text-white/70">
        Previsão hora a hora indisponível no momento — não informado.
      </p>
    );
  }

  const active = openIndex !== null ? today.hourly[openIndex] : null;

  return (
    <div className="flex flex-col gap-3">
      <div ref={scrollerRef} className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Previsão hora a hora">
        {today.hourly.map((h, i) => {
          const Icon = h.condition ? CONDITION_ICON[h.condition] : IconRain;
          const isNow = i === currentIndex;
          const isOpen = i === openIndex;
          return (
            <button
              key={h.t}
              ref={isNow ? currentRef : undefined}
              type="button"
              role="listitem"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-pressed={isOpen}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-2.5 text-center transition-colors",
                isNow
                  ? "border-white/40 bg-white/20 backdrop-blur-xl"
                  : "border-white/10 bg-white/10 backdrop-blur-xl hover:border-white/25",
                isOpen && !isNow && "border-white/25"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isNow ? "text-white" : "text-white/70"
                )}
              >
                {isNow ? "Agora" : hourLabel(h.t)}
              </span>
              <Icon size={18} className="text-white" />
              <span className="font-data text-sm text-white">
                {h.temperatureC ?? "—"}°
              </span>
              {(h.precipitationProbabilityPct ?? 0) > 0 ? (
                <span className="flex items-center gap-0.5 text-[10px] text-sky-200">
                  <IconRain size={10} />
                  {h.precipitationProbabilityPct}%
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="font-data text-lg text-white">
              {hourLabel(active.t)} · {active.temperatureC ?? "—"}°
            </span>
            <span className="text-xs text-white/70">
              {conditionLabel(active.condition)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <IconHumidity size={14} /> {active.humidityPct ?? "—"}%
            </span>
            <span className="flex items-center gap-1">
              <IconRain size={14} /> {active.precipitationProbabilityPct ?? 0}%
            </span>
            <span className="flex items-center gap-1">
              <IconWind size={14} /> {active.windSpeedKmh ?? "—"} km/h
            </span>
          </div>
          {recommendationFor(active) ? (
            <p className="border-t border-white/15 pt-2 text-sm text-white">
              {recommendationFor(active)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
