import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { redis } from "../db/redis";
import { weatherReadings, stations as stationsTable, officialAlerts } from "../db/schema";
import { fetchOpenMeteoSnapshot, OPEN_METEO_SOURCE_NAME } from "./open-meteo";
import { getRegionBySlug, type RegionSlug } from "@/lib/data/regions";
import type { RegionSnapshot, StationInfo, Trend } from "@/lib/providers/types";
import { logger } from "../lib/logger";

const CACHE_TTL_SECONDS = 10 * 60; // 10 min — clima não muda tão rápido a ponto de justificar menos

function trendFromDelta(current: number | null, previous: number | null): Trend {
  if (current === null || previous === null) return "indefinido";
  const delta = current - previous;
  if (Math.abs(delta) < 0.2) return "estavel";
  return delta > 0 ? "subindo" : "descendo";
}

async function getPreviousReading(regionSlug: string) {
  const [row] = await db
    .select()
    .from(weatherReadings)
    .where(eq(weatherReadings.regionSlug, regionSlug))
    .orderBy(desc(weatherReadings.observedAt))
    .limit(1);
  return row ?? null;
}

async function fetchRegionStations(regionSlug: string): Promise<StationInfo[]> {
  const rows = await db
    .select()
    .from(stationsTable)
    .where(eq(stationsTable.regionSlug, regionSlug));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    network: r.network,
    lat: r.lat,
    lng: r.lng,
    status: r.status,
    lastReportAt: r.lastReportAt ? r.lastReportAt.toISOString() : null,
  }));
}

async function fetchRegionAlerts(regionSlug: string) {
  const rows = await db
    .select()
    .from(officialAlerts)
    .where(and(eq(officialAlerts.regionSlug, regionSlug)));
  return rows
    .filter((r) => !r.expiresAt || r.expiresAt > new Date())
    .map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      issuingAuthority: r.issuingAuthority,
      summary: r.summary,
      issuedAt: r.issuedAt.toISOString(),
      expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
      sourceUrl: r.sourceUrl,
    }));
}

/**
 * Busca (com cache) o snapshot completo de uma região.
 *
 * Estado real de cada fonte nesta primeira versão do backend:
 * - clima: Open-Meteo, integração real (ver open-meteo.ts)
 * - rio: NÃO integrado ainda (sem credencial/pesquisa da API da ANA
 *   concluída) — retorna null explicitamente, nunca um número
 *   inventado. A tabela `river_readings` já existe para quando a
 *   integração real acontecer.
 * - alertas oficiais: lê da tabela `official_alerts`, que hoje só é
 *   populada manualmente (sem integração automática com CEMADEN/
 *   defesa civil ainda) — normalmente retorna lista vazia.
 * - estações: lê da tabela `stations`, hoje sem nenhuma seed real.
 */
export async function getRegionSnapshot(slug: RegionSlug): Promise<RegionSnapshot> {
  const region = getRegionBySlug(slug);
  if (!region) throw new Error(`Região desconhecida: ${slug}`);

  const cacheKey = `weather:${slug}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached) as RegionSnapshot;
  }

  const previous = await getPreviousReading(slug);
  const result = await fetchOpenMeteoSnapshot(region.center.lat, region.center.lng);
  if (!result.ok) {
    logger.warn("falha ao buscar clima na Open-Meteo, usando último dado salvo", {
      regionSlug: slug,
      status: result.status,
      hadPreviousReading: !!previous,
    });
  }

  const now = new Date();
  const weather: RegionSnapshot["weather"] = result.ok
    ? {
        ...result.snapshot,
        trend: trendFromDelta(result.snapshot.temperatureC, previous?.temperatureC ?? null),
        provenance: {
          source: OPEN_METEO_SOURCE_NAME,
          observedAt: now.toISOString(),
          fetchedAt: now.toISOString(),
          nature: "observado",
          status: "ok",
        },
      }
    : {
        temperatureC: previous?.temperatureC ?? null,
        feelsLikeC: previous?.feelsLikeC ?? null,
        condition: (previous?.condition as RegionSnapshot["weather"]["condition"]) ?? null,
        humidityPct: previous?.humidityPct ?? null,
        windSpeedKmh: previous?.windSpeedKmh ?? null,
        windGustKmh: previous?.windGustKmh ?? null,
        windDirectionDeg: previous?.windDirectionDeg ?? null,
        pressureHpa: previous?.pressureHpa ?? null,
        rain1hMm: previous?.rain1hMm ?? null,
        rain24hMm: previous?.rain24hMm ?? null,
        cloudCoverPct: previous?.cloudCoverPct ?? null,
        trend: "indefinido",
        provenance: {
          source: OPEN_METEO_SOURCE_NAME,
          observedAt: (previous?.observedAt ?? now).toISOString(),
          fetchedAt: now.toISOString(),
          nature: "observado",
          status: result.status,
        },
      };

  // Persiste para virar "leitura anterior" da próxima chamada e para
  // alimentar histórico futuro — mesmo em falha (grava o que tinha
  // antes de novo com status atualizado) para não perder o ponto no
  // tempo.
  if (result.ok) {
    await db.insert(weatherReadings).values({
      regionSlug: slug,
      temperatureC: weather.temperatureC,
      feelsLikeC: weather.feelsLikeC,
      condition: weather.condition,
      humidityPct: weather.humidityPct,
      windSpeedKmh: weather.windSpeedKmh,
      windGustKmh: weather.windGustKmh,
      windDirectionDeg: weather.windDirectionDeg,
      pressureHpa: weather.pressureHpa,
      rain1hMm: weather.rain1hMm,
      rain24hMm: weather.rain24hMm,
      cloudCoverPct: weather.cloudCoverPct,
      source: OPEN_METEO_SOURCE_NAME,
      nature: "observado",
      status: "ok",
      observedAt: now,
    });
  }

  const [stations, alerts] = await Promise.all([
    fetchRegionStations(slug),
    fetchRegionAlerts(slug),
  ]);

  const snapshot: RegionSnapshot = {
    regionSlug: slug,
    weather,
    // Faixa de ~7 dias + detalhamento horário, direto da Open-Meteo.
    // Quando a fonte falha, fica vazia — nunca preenchida com valor
    // inventado (ver ATUALIZACAO_DO_VIGIA.md, "nunca invente dados").
    forecast: result.ok ? result.forecast : [],
    river: null, // ver comentário da função — integração real pendente
    alerts,
    stations,
    sparkline: result.ok ? result.sparkline : [],
  };

  if (result.ok) {
    await redis.set(cacheKey, JSON.stringify(snapshot), "EX", CACHE_TTL_SECONDS).catch(() => {});
  }

  return snapshot;
}
