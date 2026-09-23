"use client";

import { useState } from "react";
import type { ForecastDay } from "@/lib/providers/types";
import { CONDITION_ICON, conditionLabel } from "@/lib/weather-labels";
import { IconRain } from "@/components/icons";
import { DayDetailDrawer } from "@/components/forecast/DayDetailDrawer";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function labelForDay(date: string, index: number) {
  if (index === 0) return "Hoje";
  // new Date("YYYY-MM-DD") é interpretado como UTC-meia-noite; para um
  // rótulo de dia da semana isso é suficiente (não depende de hora).
  const d = new Date(`${date}T12:00:00`);
  const weekday = WEEKDAY_FORMATTER.format(d).replace(".", "");
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

/**
 * Faixa de previsão de ~7 dias (Nível 2 da hierarquia de informação).
 * Cada dia é compacto por padrão; clicar abre o detalhamento
 * (Nível 3) num Drawer, sem alterar o restante da página — conforme
 * pedido em ATUALIZACAO_DO_VIGIA.md, seção "Detalhamento de um dia".
 */
export function ForecastStrip({
  forecast,
  regionLabel,
}: {
  forecast: ForecastDay[];
  regionLabel: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (forecast.length === 0) {
    return (
      <p className="text-sm text-[color:var(--color-text-subtle)]">
        Previsão de vários dias indisponível no momento — não informado.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        {forecast.map((day, i) => {
          const Icon = day.condition ? CONDITION_ICON[day.condition] : IconRain;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-haspopup="dialog"
              className="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-center transition-colors hover:bg-[color:var(--color-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-interactive)]"
            >
              <span className="text-xs font-medium text-[color:var(--color-text-subtle)]">
                {labelForDay(day.date, i)}
              </span>
              <span className="text-[10px] text-[color:var(--color-text-subtle)]">
                {DAY_FORMATTER.format(new Date(`${day.date}T12:00:00`))}
              </span>
              <Icon size={20} className="text-[color:var(--color-accent)]" />
              <span className="font-data text-sm text-[color:var(--color-text)]">
                {day.temperatureMaxC ?? "—"}° / {day.temperatureMinC ?? "—"}°
              </span>
              {day.precipitationProbabilityMaxPct !== null && day.precipitationProbabilityMaxPct > 0 ? (
                <span className="flex items-center gap-0.5 text-[10px] text-[color:var(--color-accent)]">
                  <IconRain size={11} />
                  {day.precipitationProbabilityMaxPct}%
                </span>
              ) : (
                <span className="text-[10px] text-[color:var(--color-text-subtle)]">—</span>
              )}
            </button>
          );
        })}
      </div>

      {openIndex !== null ? (
        <DayDetailDrawer
          day={forecast[openIndex]}
          regionLabel={regionLabel}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Previsto · fonte Open-Meteo. {conditionLabel(forecast[0]?.condition)} hoje em {regionLabel}.
      </p>
    </>
  );
}
