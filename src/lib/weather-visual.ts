import { IconSun, IconCloud, IconRain, IconLightning, IconMoon } from "@/components/icons";
import type { WeatherSnapshot } from "./providers/types";

type Condition = NonNullable<WeatherSnapshot["condition"]>;

/**
 * É dia ou noite agora, para o local? Usa nascer/pôr do sol reais do
 * `ForecastDay` quando disponíveis (nunca aproxima com hora "chutada"
 * se o dado existir). Sem esse dado, cai num fallback grosseiro
 * (6h–18h) só para não deixar a UI sem nenhum estilo.
 */
export function isDaytime(
  sunriseISO: string | null,
  sunsetISO: string | null,
  now: Date = new Date()
): boolean {
  if (!sunriseISO || !sunsetISO) {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone: "America/Sao_Paulo",
      }).format(now)
    );
    return hour >= 6 && hour < 18;
  }
  const t = now.getTime();
  return t >= new Date(sunriseISO).getTime() && t < new Date(sunsetISO).getTime();
}

export type WeatherVisual = {
  /** Descrição curta do "clima" visual — não é rótulo oficial de condição. */
  label: string;
  gradient: string;
  Icon: typeof IconSun;
  stars?: boolean;
};

/**
 * Só decoração (gradiente + ícone) — nunca usado como fonte de dado.
 * A condição real segue vindo de `conditionLabel`/`CONDITION_LABEL`
 * em weather-labels.ts; isto aqui só escolhe a "roupagem" visual.
 */
export function getWeatherVisual(condition: Condition | null, isDay: boolean): WeatherVisual {
  if (!condition) {
    return isDay
      ? { label: "Sem dado", gradient: "linear-gradient(160deg, #94a3b8, #64748b)", Icon: IconCloud }
      : { label: "Sem dado", gradient: "linear-gradient(160deg, #1f2937, #0f172a)", Icon: IconMoon, stars: true };
  }

  switch (condition) {
    case "ceu-limpo":
      return isDay
        ? { label: "Sol sem nuvens", gradient: "linear-gradient(160deg, #38bdf8, #fbbf24)", Icon: IconSun }
        : { label: "Noite estrelada", gradient: "linear-gradient(160deg, #1e293b, #0f172a)", Icon: IconMoon, stars: true };

    case "parcialmente-nublado":
      return isDay
        ? { label: "Sol entre nuvens", gradient: "linear-gradient(160deg, #7dd3fc, #94a3b8)", Icon: IconCloud }
        : { label: "Nuvens à noite", gradient: "linear-gradient(160deg, #334155, #1e293b)", Icon: IconCloud, stars: true };

    case "nublado":
      return isDay
        ? { label: "Nublado", gradient: "linear-gradient(160deg, #94a3b8, #64748b)", Icon: IconCloud }
        : { label: "Nublado à noite", gradient: "linear-gradient(160deg, #334155, #0f172a)", Icon: IconCloud };

    case "chuva-fraca":
    case "chuva-moderada":
    case "chuva-forte":
      return isDay
        ? { label: "Nuvens de chuva", gradient: "linear-gradient(160deg, #64748b, #3b82f6)", Icon: IconRain }
        : { label: "Chuva à noite", gradient: "linear-gradient(160deg, #1e293b, #1e3a8a)", Icon: IconRain, stars: true };

    case "tempestade":
      return { label: "Tempestade", gradient: "linear-gradient(160deg, #334155, #111827)", Icon: IconLightning };

    case "nevoeiro":
      return isDay
        ? { label: "Nevoeiro", gradient: "linear-gradient(160deg, #cbd5e1, #94a3b8)", Icon: IconCloud }
        : { label: "Nevoeiro à noite", gradient: "linear-gradient(160deg, #475569, #1e293b)", Icon: IconCloud };
  }
}

/** Camada de "estrelas" só em CSS (sem asset externo) para os cartões noturnos. */
export const STARS_BACKGROUND =
  "radial-gradient(1px 1px at 15% 20%, #fff, transparent), " +
  "radial-gradient(1px 1px at 35% 65%, #fff, transparent), " +
  "radial-gradient(1.5px 1.5px at 55% 30%, #fff, transparent), " +
  "radial-gradient(1px 1px at 70% 75%, #fff, transparent), " +
  "radial-gradient(1px 1px at 85% 15%, #fff, transparent), " +
  "radial-gradient(1.5px 1.5px at 25% 85%, #fff, transparent), " +
  "radial-gradient(1px 1px at 92% 55%, #fff, transparent)";
