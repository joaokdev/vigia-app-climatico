/**
 * MOCK PROVIDERS — FASE 1
 * ============================================================
 * Estes providers existem SOMENTE para permitir que a interface
 * seja demonstrada com uma forma de dado plausível. Eles NÃO são
 * uma integração real e não devem ser tratados como tal.
 *
 * Na FASE 2, cada `mockXProvider` é substituído por um provider
 * real com a MESMA assinatura de retorno (ver `../types.ts`):
 *
 *   mockWeatherProvider   -> OpenMeteoProvider / INMETProvider
 *   mockRiverProvider     -> ANAProvider
 *   mockAlertProvider     -> CEMADENProvider / defesa civil
 *   mockStationProvider   -> ANAProvider / INMETProvider
 *
 * Os componentes de UI nunca importam este arquivo diretamente;
 * eles recebem `RegionSnapshot` já pronto via `getRegionSnapshot`
 * (ver `../index.ts`), o que torna a troca por dados reais uma
 * mudança de uma linha, não uma reescrita de componentes.
 * ============================================================
 */

import type {
  OfficialAlert,
  ProviderStatus,
  RegionSnapshot,
  RiverSnapshot,
  StationInfo,
  TimeseriesPoint,
  Trend,
  WeatherSnapshot,
} from "../types";
import type { RegionSlug } from "../../data/regions";

const MINUTE = 60_000;

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * MINUTE).toISOString();
}

/** Perfis fixos e plausíveis por região — não são medições reais. */
const WEATHER_PROFILES: Record<
  RegionSlug,
  Omit<WeatherSnapshot, "provenance">
> = {
  "uniao-da-vitoria": {
    temperatureC: 18.4,
    feelsLikeC: 17.9,
    condition: "chuva-moderada",
    humidityPct: 88,
    windSpeedKmh: 14,
    windGustKmh: 26,
    windDirectionDeg: 210,
    pressureHpa: 1009,
    rain1hMm: 3.2,
    rain24hMm: 41.6,
    cloudCoverPct: 92,
    trend: "subindo",
  },
  "cruz-machado": {
    temperatureC: 16.1,
    feelsLikeC: 15.2,
    condition: "nublado",
    humidityPct: 82,
    windSpeedKmh: 11,
    windGustKmh: 19,
    windDirectionDeg: 190,
    pressureHpa: 1012,
    rain1hMm: 0.4,
    rain24hMm: 12.0,
    cloudCoverPct: 74,
    trend: "estavel",
  },
  bituruna: {
    temperatureC: 13.7,
    feelsLikeC: 12.1,
    condition: "parcialmente-nublado",
    humidityPct: 76,
    windSpeedKmh: 18,
    windGustKmh: 31,
    windDirectionDeg: 230,
    pressureHpa: 1015,
    rain1hMm: 0,
    rain24hMm: 4.2,
    cloudCoverPct: 55,
    trend: "descendo",
  },
  "inacio-martins": {
    temperatureC: 20.9,
    feelsLikeC: 21.4,
    condition: "ceu-limpo",
    humidityPct: 58,
    windSpeedKmh: 8,
    windGustKmh: 14,
    windDirectionDeg: 60,
    pressureHpa: 1017,
    rain1hMm: 0,
    rain24hMm: 0,
    cloudCoverPct: 15,
    trend: "estavel",
  },
};

const RIVER_PROFILES: Partial<Record<RegionSlug, Omit<RiverSnapshot, "provenance" | "history7d">>> = {
  "uniao-da-vitoria": {
    riverName: "Rio Iguaçu",
    levelM: 6.82,
    levelTrend: "subindo",
    flowM3s: 412,
    stationName: "União da Vitória (régua Porto União)",
    vigiaAttentionLevel: "observacao",
  },
};

const STATUS_BY_REGION: Record<RegionSlug, ProviderStatus> = {
  "uniao-da-vitoria": "ok",
  "cruz-machado": "ok",
  bituruna: "stale",
  "inacio-martins": "ok",
};

function buildSparkline(seed: number): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const noise = Math.sin(seed + i * 0.6) * 2.2;
    points.push({
      t: isoMinutesAgo(i * 30),
      v: Math.round((seed + noise) * 10) / 10,
    });
  }
  return points;
}

/** Histórico diário de nível de rio dos últimos 7 dias — dado de
 * demonstração, consultado sob demanda (Nível 3 da hierarquia de
 * informação), nunca exibido por padrão junto ao snapshot atual. */
function buildRiverHistory(currentLevel: number, trend: Trend): TimeseriesPoint[] {
  const points: TimeseriesPoint[] = [];
  const direction = trend === "subindo" ? 1 : trend === "descendo" ? -1 : 0;
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const drift = direction * (daysAgo * 0.14);
    const noise = Math.sin(daysAgo * 1.3) * 0.22;
    const value = currentLevel - drift + noise;
    points.push({
      t: isoMinutesAgo(daysAgo * 24 * 60),
      v: Math.round(value * 100) / 100,
    });
  }
  return points;
}

const SEED_BY_REGION: Record<RegionSlug, number> = {
  "uniao-da-vitoria": 18,
  "cruz-machado": 16,
  bituruna: 13,
  "inacio-martins": 21,
};

function mockWeatherProvider(slug: RegionSlug): WeatherSnapshot {
  const status = STATUS_BY_REGION[slug];
  const profile = WEATHER_PROFILES[slug];
  return {
    ...profile,
    provenance: {
      source: "Open-Meteo (demonstração)",
      station: undefined,
      observedAt: isoMinutesAgo(status === "stale" ? 190 : 8),
      fetchedAt: isoMinutesAgo(status === "stale" ? 185 : 3),
      nature: "observado",
      status,
    },
  };
}

function mockRiverProvider(slug: RegionSlug): RiverSnapshot | null {
  const profile = RIVER_PROFILES[slug];
  if (!profile) return null;
  return {
    ...profile,
    history7d: buildRiverHistory(profile.levelM ?? 0, profile.levelTrend),
    provenance: {
      source: "ANA HidroWebService (demonstração)",
      station: profile.stationName ?? undefined,
      observedAt: isoMinutesAgo(22),
      fetchedAt: isoMinutesAgo(15),
      nature: "observado",
      status: "ok",
    },
  };
}

function mockAlertProvider(slug: RegionSlug): OfficialAlert[] {
  if (slug === "uniao-da-vitoria") {
    return [
      {
        id: "alerta-demo-1",
        title: "Aviso de chuva intensa para a bacia do Rio Iguaçu",
        severity: "atencao",
        issuingAuthority: "Defesa Civil (dado de demonstração)",
        summary:
          "Exemplo de estrutura de alerta oficial para a FASE 1. Nenhum alerta real está ativo — este conteúdo é apenas ilustrativo.",
        issuedAt: isoMinutesAgo(120),
        expiresAt: null,
        sourceUrl: null,
      },
    ];
  }
  return [];
}

function mockStationProvider(slug: RegionSlug): StationInfo[] {
  const region = SEED_BY_REGION[slug];
  const base: StationInfo[] = [
    {
      id: `${slug}-met-01`,
      name: "Estação meteorológica automática",
      type: "meteorologica",
      network: "INMET (demonstração)",
      lat: 0,
      lng: 0,
      status: STATUS_BY_REGION[slug],
      lastReportAt: isoMinutesAgo(8),
    },
  ];
  if (RIVER_PROFILES[slug]) {
    base.push({
      id: `${slug}-flu-01`,
      name: "Régua fluviométrica",
      type: "fluviometrica",
      network: "ANA (demonstração)",
      lat: 0,
      lng: 0,
      status: "ok",
      lastReportAt: isoMinutesAgo(15),
    });
  }
  void region;
  return base;
}

export function getMockRegionSnapshot(slug: RegionSlug): RegionSnapshot {
  return {
    regionSlug: slug,
    weather: mockWeatherProvider(slug),
    river: mockRiverProvider(slug),
    alerts: mockAlertProvider(slug),
    stations: mockStationProvider(slug),
    sparkline: buildSparkline(SEED_BY_REGION[slug]),
  };
}
