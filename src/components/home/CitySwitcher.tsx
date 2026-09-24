"use client";

import Link from "next/link";
import type { RegionSlug } from "@/lib/data/regions";
import { getWeatherVisual, STARS_BACKGROUND } from "@/lib/weather-visual";
import type { WeatherSnapshot } from "@/lib/providers/types";
import { cn } from "@/lib/cn";
import { CITY_COOKIE } from "./CityWelcome";

export type CityCardData = {
  slug: RegionSlug;
  shortName: string;
  temperatureC: WeatherSnapshot["temperatureC"];
  condition: WeatherSnapshot["condition"];
  isDay: boolean;
};

/**
 * Seletor de cidade em cards ilustrados — cada card mostra um
 * "clima em miniatura" (gradiente + ícone) condizente com a condição
 * e o horário (dia/noite) daquela cidade agora, não só o nome dela
 * numa lista neutra. A decoração vem de weather-visual.ts; o dado em
 * si (temperatura/condição) continua vindo do snapshot real.
 * Trocar de cidade aqui também atualiza o cookie de preferência, para
 * a próxima visita já abrir direto na cidade escolhida por último.
 */
export function CityCards({ cities, activeSlug }: { cities: CityCardData[]; activeSlug: RegionSlug }) {
  return (
    <nav aria-label="Selecionar cidade" className="flex gap-3 overflow-x-auto pb-1">
      {cities.map((city) => {
        const isActive = city.slug === activeSlug;
        const visual = getWeatherVisual(city.condition, city.isDay);
        const Icon = visual.Icon;

        return (
          <Link
            key={city.slug}
            href={`/?cidade=${city.slug}`}
            onClick={() => {
              document.cookie = `${CITY_COOKIE}=${city.slug}; path=/; max-age=31536000; samesite=lax`;
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-28 w-32 shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.97] active:duration-100",
              isActive ? "ring-2 ring-white/80 ring-offset-2 ring-offset-transparent" : "hover:-translate-y-0.5"
            )}
            style={{ backgroundImage: visual.gradient }}
          >
            {/* estrelas, só nos cards noturnos */}
            {visual.stars ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: STARS_BACKGROUND }}
              />
            ) : null}
            {/* véu escuro sutil de baixo pra cima — garante contraste do texto
                branco em qualquer gradiente, claro ou escuro */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "linear-gradient(0deg, rgba(15,23,42,0.55), rgba(15,23,42,0) 60%)" }}
            />

            <div className="relative flex items-start justify-between">
              <span className="text-xs font-semibold text-white drop-shadow">{city.shortName}</span>
              <Icon size={20} className="text-white drop-shadow" />
            </div>
            <div className="relative flex flex-col gap-0.5">
              <span className="font-data text-2xl leading-none text-white drop-shadow">
                {city.temperatureC ?? "—"}°
              </span>
              <span className="text-[10px] text-white/90 drop-shadow">{visual.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
