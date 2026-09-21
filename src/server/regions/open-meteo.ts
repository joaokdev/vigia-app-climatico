import type {
  WeatherSnapshot,
  ProviderStatus,
  ForecastDay,
  HourlyForecastPoint,
  Provenance,
} from "@/lib/providers/types";

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

// Variáveis horárias — cobrem tanto o sparkline de curto prazo quanto
// o detalhamento por hora de cada dia da faixa de previsão (Nível 3
// da hierarquia de informação: "Previsão detalhada" no escopo desta
// atualização).
const HOURLY_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation",
  "precipitation_probability",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "relative_humidity_2m",
  "surface_pressure",
  "cloud_cover",
  "dew_point_2m",
  "visibility",
  "uv_index",
  "weather_code",
].join(",");

// Variáveis diárias — alimentam a faixa de ~7 dias e o resumo de cada
// dia (mín/máx, probabilidade e volume de chuva, vento, sol, UV).
const DAILY_VARS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "uv_index_max",
  "sunrise",
  "sunset",
].join(",");

/** Quantos dias de previsão futura buscar (hoje + 6 dias = 7 no total). */
const FORECAST_DAYS = 7;

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
    apparent_temperature: (number | null)[];
    precipitation: (number | null)[];
    precipitation_probability: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_gusts_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
    relative_humidity_2m: (number | null)[];
    surface_pressure: (number | null)[];
    cloud_cover: (number | null)[];
    dew_point_2m: (number | null)[];
    visibility: (number | null)[];
    uv_index: (number | null)[];
    weather_code: (number | null)[];
  };
  daily?: {
    time: string[];
    weather_code: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max: (number | null)[];
    wind_gusts_10m_max: (number | null)[];
    uv_index_max: (number | null)[];
    sunrise: (string | null)[];
    sunset: (string | null)[];
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
  | {
      ok: true;
      snapshot: Omit<WeatherSnapshot, "provenance">;
      sparkline: { t: string; v: number | null }[];
      forecast: ForecastDay[];
    }
  | { ok: false; status: ProviderStatus };

/** Constrói o detalhamento horário (Nível 3) de um único dia (YYYY-MM-DD). */
function buildHourlyForDay(
  hourly: NonNullable<OpenMeteoResponse["hourly"]>,
  date: string
): HourlyForecastPoint[] {
  const points: HourlyForecastPoint[] = [];
  for (let i = 0; i < hourly.time.length; i++) {
    if (!hourly.time[i].startsWith(date)) continue;
    points.push({
      t: new Date(hourly.time[i]).toISOString(),
      temperatureC: hourly.temperature_2m[i] ?? null,
      feelsLikeC: hourly.apparent_temperature[i] ?? null,
      precipitationMm: hourly.precipitation[i] ?? null,
      precipitationProbabilityPct: hourly.precipitation_probability[i] ?? null,
      windSpeedKmh: hourly.wind_speed_10m[i] ?? null,
      windGustKmh: hourly.wind_gusts_10m[i] ?? null,
      windDirectionDeg: hourly.wind_direction_10m[i] ?? null,
      humidityPct: hourly.relative_humidity_2m[i] ?? null,
      pressureHpa: hourly.surface_pressure[i] ?? null,
      cloudCoverPct: hourly.cloud_cover[i] ?? null,
      dewPointC: hourly.dew_point_2m[i] ?? null,
      visibilityM: hourly.visibility[i] ?? null,
      uvIndex: hourly.uv_index[i] ?? null,
      condition: mapWeatherCode(hourly.weather_code[i] ?? null),
    });
  }
  return points;
}

function buildForecast(
  daily: NonNullable<OpenMeteoResponse["daily"]>,
  hourly: NonNullable<OpenMeteoResponse["hourly"]>,
  fetchedAt: Date
): ForecastDay[] {
  return daily.time.map((date, i) => {
    const provenance: Provenance = {
      source: OPEN_METEO_SOURCE_NAME,
      observedAt: fetchedAt.toISOString(),
      fetchedAt: fetchedAt.toISOString(),
      validUntil: `${date}T23:59:59-03:00`,
      nature: "previsto",
      status: "ok",
    };
    return {
      date,
      condition: mapWeatherCode(daily.weather_code[i] ?? null),
      temperatureMaxC: daily.temperature_2m_max[i] ?? null,
      temperatureMinC: daily.temperature_2m_min[i] ?? null,
      precipitationProbabilityMaxPct: daily.precipitation_probability_max[i] ?? null,
      precipitationSumMm: daily.precipitation_sum[i] ?? null,
      windSpeedMaxKmh: daily.wind_speed_10m_max[i] ?? null,
      windGustMaxKmh: daily.wind_gusts_10m_max[i] ?? null,
      uvIndexMax: daily.uv_index_max[i] ?? null,
      sunrise: daily.sunrise[i] ? new Date(daily.sunrise[i] as string).toISOString() : null,
      sunset: daily.sunset[i] ? new Date(daily.sunset[i] as string).toISOString() : null,
      hourly: buildHourlyForDay(hourly, date),
      provenance,
    };
  });
}

export async function fetchOpenMeteoSnapshot(lat: number, lng: number): Promise<OpenMeteoResult> {
  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", CURRENT_VARS);
  url.searchParams.set("hourly", HOURLY_VARS);
  url.searchParams.set("daily", DAILY_VARS);
  url.searchParams.set("past_days", "1");
  url.searchParams.set("forecast_days", String(FORECAST_DAYS));
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
  if (!data.current || !data.hourly || !data.daily) {
    return { ok: false, status: "degradado" };
  }

  const { current, hourly, daily } = data;

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
    forecast: buildForecast(daily, hourly, new Date(current.time)),
  };
}

export { mapWeatherCode as __internal_mapWeatherCode };
export const OPEN_METEO_SOURCE_NAME = "Open-Meteo";
