import type { WeatherSnapshot, ProviderStatus } from "@/lib/providers/types";

/**
 * Adapter para a Weather Forecast API da Open-Meteo (api.open-meteo.com).
 * Gratuita, sem chave de API, uso não-comercial — ver /fontes no front.
 *
 * IMPORTANTE (transparência): este adapter foi escrito a partir da
 * documentação oficial (open-meteo.com/en/docs), mas não pôde ser
 * testado contra a API ao vivo a partir deste ambiente de
 * desenvolvimento — o sandbox bloqueia a saída de rede para domínios
 * fora de uma lista pequena de permitidos, e api.open-meteo.com não
 * está nela. Teste este adapter contra a API real assim que possível
 * num ambiente com acesso de rede normal antes de confiar nele em
 * produção (ex: `curl` a URL montada abaixo e comparar com o JSON
 * esperado documentado nos comentários).
 */

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

const CURRENT_VARS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "weather_code",
  "cloud_cover",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
].join(",");

type OpenMeteoResponse = {
  current?: {
    time: string;
    temperature_2m: number | null;
    relative_humidity_2m: number | null;
    apparent_temperature: number | null;
    weather_code: number | null;
    cloud_cover: number | null;
    pressure_msl: number | null;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
    wind_gusts_10m: number | null;
  };
  hourly?: {
    time: string[];
    temperature_2m: (number | null)[];
    precipitation: (number | null)[];
  };
};

/** Mapeamento dos códigos WMO (ww) para o vocabulário de condição do VIGIA. */
function mapWeatherCode(code: number | null): WeatherSnapshot["condition"] {
  if (code === null) return null;
  if (code === 0) return "ceu-limpo";
  if (code === 1 || code === 2) return "parcialmente-nublado";
  if (code === 3) return "nublado";
  if (code === 45 || code === 48) return "nevoeiro";
  if ([51, 53, 55, 56, 57].includes(code)) return "chuva-fraca";
  if ([61, 63, 66].includes(code)) return "chuva-moderada";
  if ([65, 67, 80, 81].includes(code)) return "chuva-forte";
  if (code === 82) return "chuva-forte";
  if ([95, 96, 99].includes(code)) return "tempestade";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "chuva-forte"; // neve — sem categoria própria no VIGIA
  return "nublado";
}

export type OpenMeteoResult =
  | { ok: true; snapshot: Omit<WeatherSnapshot, "provenance">; sparkline: { t: string; v: number | null }[] }
  | { ok: false; status: ProviderStatus };

export async function fetchOpenMeteoSnapshot(lat: number, lng: number): Promise<OpenMeteoResult> {
  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", CURRENT_VARS);
  url.searchParams.set("hourly", "temperature_2m,precipitation");
  url.searchParams.set("past_days", "1");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "America/Sao_Paulo");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      // Nunca deixa uma Open-Meteo lenta travar a requisição do VIGIA
      // indefinidamente — 8s é generoso para uma API que documenta
      // <10ms de tempo de geração típico.
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, status: "indisponivel" };
  }

  if (!res.ok) {
    return { ok: false, status: res.status >= 500 ? "indisponivel" : "degradado" };
  }

  const data = (await res.json()) as OpenMeteoResponse;
  if (!data.current || !data.hourly) {
    return { ok: false, status: "degradado" };
  }

  const { current, hourly } = data;

  // A hora "atual" dentro do array hourly — usada para somar chuva de
  // 1h/24h e para não incluir horas futuras no sparkline de tendência.
  const nowIndex = hourly.time.indexOf(current.time.slice(0, 13) + ":00");
  const currentHourIndex = nowIndex >= 0 ? nowIndex : hourly.time.length - 1;

  const rain1h = hourly.precipitation[currentHourIndex] ?? null;
  const last24h: (number | null)[] = hourly.precipitation.slice(
    Math.max(0, currentHourIndex - 23),
    currentHourIndex + 1
  );
  const rain24h = last24h.length
    ? Math.round(last24h.reduce((sum: number, v) => sum + (v ?? 0), 0) * 10) / 10
    : null;

  // Sparkline: últimas 12 horas de temperatura (resolução horária da
  // Open-Meteo — mais grosseira que os 30 min do dado de demonstração
  // da FASE 1, mas é o que a fonte real oferece).
  const sparklineStart = Math.max(0, currentHourIndex - 11);
  const sparkline = hourly.time
    .slice(sparklineStart, currentHourIndex + 1)
    .map((t, i) => ({
      t: new Date(t).toISOString(),
      v: hourly.temperature_2m[sparklineStart + i] ?? null,
    }));

  return {
    ok: true,
    snapshot: {
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      condition: mapWeatherCode(current.weather_code),
      humidityPct: current.relative_humidity_2m,
      windSpeedKmh: current.wind_speed_10m,
      windGustKmh: current.wind_gusts_10m,
      windDirectionDeg: current.wind_direction_10m,
      pressureHpa: current.pressure_msl,
      rain1hMm: rain1h,
      rain24hMm: rain24h,
      cloudCoverPct: current.cloud_cover,
      trend: "indefinido", // calculado depois, comparando com a leitura anterior salva no banco
    },
    sparkline,
  };
}

export { mapWeatherCode as __internal_mapWeatherCode };
export const OPEN_METEO_SOURCE_NAME = "Open-Meteo";
