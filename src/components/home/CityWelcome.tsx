"use client";

import { useRouter } from "next/navigation";
import type { CityCardData } from "./CitySwitcher";
import { getWeatherVisual, STARS_BACKGROUND } from "@/lib/weather-visual";
import { getRegionBySlug } from "@/lib/data/regions";

export const CITY_COOKIE = "vigia_cidade";

/**
 * "Olá 👋 Qual cidade você deseja acompanhar?" — porta de entrada do
 * app na primeira visita. Depois que o usuário escolhe, a cidade fica
 * salva num cookie (1 ano) e essa tela deixa de aparecer — quem quiser
 * trocar de cidade depois usa os cards no topo da tela do dia.
 */
export function CityWelcome({ cities }: { cities: CityCardData[] }) {
  const router = useRouter();

  function selectCity(slug: string) {
    document.cookie = `${CITY_COOKIE}=${slug}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/?cidade=${slug}`);
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundImage: "linear-gradient(180deg, #1e1b4b 0%, #312e81 45%, #7c3aed 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{ backgroundImage: STARS_BACKGROUND, backgroundSize: "130% 130%" }}
      />

      <div className="flex w-full max-w-2xl flex-col items-center gap-2 text-center">
        <p className="text-4xl motion-safe:animate-[card-in_0.5s_ease-out]">Olá 👋</p>
        <h1
          className="text-display motion-safe:animate-[card-in_0.5s_ease-out_0.08s_backwards]"
          style={{ color: "white", letterSpacing: "-0.02em" }}
        >
          Qual cidade você deseja acompanhar?
        </h1>
      </div>

      <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        {cities.map((city, i) => {
          const visual = getWeatherVisual(city.condition, city.isDay);
          const Icon = visual.Icon;
          const region = getRegionBySlug(city.slug);

          return (
            <button
              key={city.slug}
              type="button"
              onClick={() => selectCity(city.slug)}
              style={{
                backgroundImage: visual.gradient,
                animationDelay: `${0.12 + i * 0.06}s`,
              }}
              className="motion-safe:animate-[card-in_0.5s_ease-out_backwards] group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.97] active:duration-100"
            >
              {visual.stars ? (
                <span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: STARS_BACKGROUND }} />
              ) : null}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-200 group-hover:opacity-70"
                style={{ backgroundImage: "linear-gradient(0deg, rgba(15,23,42,0.65), rgba(15,23,42,0.05) 55%)" }}
              />

              <div className="relative flex items-start justify-between">
                <Icon size={22} className="text-white drop-shadow" />
              </div>
              <div className="relative flex flex-col gap-0.5">
                <span className="text-sm font-semibold leading-tight text-white drop-shadow">{city.shortName}</span>
                <span className="text-xs text-white/80 drop-shadow">{region?.state}</span>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-data text-2xl leading-none text-white drop-shadow">{city.temperatureC ?? "—"}°</span>
                </div>
                <span className="text-[11px] text-white/85 drop-shadow">{visual.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
