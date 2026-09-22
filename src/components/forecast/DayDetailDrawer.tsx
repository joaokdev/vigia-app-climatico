"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Sparkline } from "@/components/ui/Sparkline";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { conditionLabel } from "@/lib/weather-labels";
import type { ForecastDay } from "@/lib/providers/types";
import {
  IconCloud,
  IconEye,
  IconHumidity,
  IconPressure,
  IconRain,
  IconSun,
  IconWind,
} from "@/components/icons";

const HOUR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: "America/Sao_Paulo",
});

function hour(iso: string) {
  return HOUR_FORMATTER.format(new Date(iso));
}

/**
 * Detalhamento profundo de um dia (Nível 3 da hierarquia de
 * informação). Organizado em blocos — temperatura, chuva, vento,
 * atmosfera, sol e linha do tempo — em vez de despejar todas as
 * métricas juntas, conforme pedido explicitamente em
 * ATUALIZACAO_DO_VIGIA.md ("Não exibir todas essas métricas
 * simultaneamente na primeira abertura").
 */
export function DayDetailDrawer({
  day,
  regionLabel,
  onClose,
}: {
  day: ForecastDay;
  regionLabel: string;
  onClose: () => void;
}) {
  const dateLabel = FULL_DATE_FORMATTER.format(new Date(`${day.date}T12:00:00`));
  const temperatureSeries = day.hourly.map((h) => ({ t: h.t, v: h.temperatureC }));
  const precipitationSeries = day.hourly.map((h) => ({ t: h.t, v: h.precipitationMm }));

  return (
    <Drawer open onClose={onClose} title={`${dateLabel} · ${regionLabel}`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {conditionLabel(day.condition)}
          </p>
          <NatureBadge nature={day.provenance.nature} />
        </div>

        {/* Temperatura */}
        <section className="flex flex-col gap-2">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Temperatura</h3>
          <div className="flex items-baseline gap-3">
            <span className="font-data text-2xl text-[color:var(--color-text)]">
              {day.temperatureMaxC ?? "—"}°
            </span>
            <span className="text-sm text-[color:var(--color-text-subtle)]">
              mín. {day.temperatureMinC ?? "—"}°
            </span>
          </div>
          {temperatureSeries.some((p) => p.v !== null) ? (
            <Sparkline
              points={temperatureSeries}
              width={280}
              height={56}
              ariaLabel={`Evolução da temperatura ao longo do dia em ${regionLabel}`}
            />
          ) : null}
        </section>

        {/* Chuva */}
        <section className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Chuva</h3>
          <div className="grid grid-cols-2 gap-3">
            <WeatherMetric
              icon={<IconRain size={16} />}
              label="Acumulado do dia"
              value={day.precipitationSumMm}
              unit="mm"
            />
            <WeatherMetric
              icon={<IconRain size={16} />}
              label="Probabilidade máxima"
              value={day.precipitationProbabilityMaxPct}
              unit="%"
            />
          </div>
          {precipitationSeries.some((p) => (p.v ?? 0) > 0) ? (
            <Sparkline
              points={precipitationSeries}
              width={280}
              height={40}
              ariaLabel={`Precipitação por hora em ${regionLabel}`}
            />
          ) : (
            <p className="text-xs text-[color:var(--color-text-subtle)]">Sem chuva prevista nas horas do dia.</p>
          )}
        </section>

        {/* Vento */}
        <section className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Vento</h3>
          <div className="grid grid-cols-2 gap-3">
            <WeatherMetric icon={<IconWind size={16} />} label="Máxima" value={day.windSpeedMaxKmh} unit="km/h" />
            <WeatherMetric icon={<IconWind size={16} />} label="Rajada máxima" value={day.windGustMaxKmh} unit="km/h" />
          </div>
        </section>

        {/* Atmosfera */}
        <section className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Atmosfera</h3>
          <div className="grid grid-cols-2 gap-3">
            <WeatherMetric
              icon={<IconHumidity size={16} />}
              label="Umidade (meio-dia)"
              value={day.hourly.find((h) => hour(h.t).startsWith("12"))?.humidityPct ?? null}
              unit="%"
            />
            <WeatherMetric
              icon={<IconPressure size={16} />}
              label="Pressão (meio-dia)"
              value={day.hourly.find((h) => hour(h.t).startsWith("12"))?.pressureHpa ?? null}
              unit="hPa"
            />
            <WeatherMetric
              icon={<IconCloud size={16} />}
              label="Nebulosidade (meio-dia)"
              value={day.hourly.find((h) => hour(h.t).startsWith("12"))?.cloudCoverPct ?? null}
              unit="%"
            />
            <WeatherMetric
              icon={<IconEye size={16} />}
              label="Visibilidade (meio-dia)"
              value={
                day.hourly.find((h) => hour(h.t).startsWith("12"))?.visibilityM !== undefined
                  ? Math.round((day.hourly.find((h) => hour(h.t).startsWith("12"))?.visibilityM ?? 0) / 1000)
                  : null
              }
              unit="km"
            />
          </div>
        </section>

        {/* Sol */}
        <section className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Sol</h3>
          <div className="grid grid-cols-2 gap-3">
            <WeatherMetric icon={<IconSun size={16} />} label="Nascer do sol" value={day.sunrise ? hour(day.sunrise) : null} />
            <WeatherMetric icon={<IconSun size={16} />} label="Pôr do sol" value={day.sunset ? hour(day.sunset) : null} />
          </div>
          <WeatherMetric icon={<IconSun size={16} />} label="Índice UV máximo" value={day.uvIndexMax} />
        </section>

        {/* Linha do tempo — horas do dia */}
        <section className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-eyebrow text-[color:var(--color-text-subtle)]">Linha do tempo</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {day.hourly
              .filter((_, i) => i % 3 === 0)
              .map((h) => (
                <div key={h.t} className="flex shrink-0 flex-col items-center gap-1 text-center">
                  <span className="text-[11px] text-[color:var(--color-text-subtle)]">{hour(h.t)}</span>
                  <span className="font-data text-sm text-[color:var(--color-text)]">
                    {h.temperatureC ?? "—"}°
                  </span>
                  <span className="text-[10px] text-[color:var(--color-accent)]">
                    {h.precipitationProbabilityPct ?? 0}%
                  </span>
                </div>
              ))}
          </div>
        </section>

        <p className="text-[11px] text-[color:var(--color-text-subtle)]">
          Previsto · válido até {new Date(day.provenance.validUntil ?? day.provenance.fetchedAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </Drawer>
  );
}
