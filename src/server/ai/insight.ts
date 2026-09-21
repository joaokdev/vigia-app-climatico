import { redis } from "../db/redis";
import { logger } from "../lib/logger";
import { generateWithNvidia } from "./nvidia";
import type { RegionSnapshot } from "@/lib/providers/types";
import { conditionLabel } from "@/lib/weather-labels";

/**
 * "VIGIA Intelligence" — camada de interpretação por IA (ver
 * ATUALIZACAO_DO_VIGIA.md, seção 13 e limitações do
 * VIGIA_MASTER_PROMPT original): a IA nunca é fonte de dado
 * meteorológico/hidrológico, só resume/classifica o que o próprio
 * VIGIA já mediu ou previu. Sem chat público — geração acontece só
 * no servidor, no carregamento da página da cidade, com cache
 * agressivo em Redis para ser econômica em chamadas.
 */

const CACHE_TTL_SECONDS = 45 * 60; // 45 min — insight muda pouco entre uma consulta e outra

export type RegionInsight = {
  text: string;
  model: string;
  generatedAt: string; // ISO 8601
};

const SYSTEM_PROMPT =
  "Você é o VIGIA Intelligence, camada de interpretação de um painel meteorológico regional " +
  "para União da Vitória, Cruz Machado, Bituruna e Inácio Martins (PR/SC, Brasil). " +
  "Escreva SOMENTE com base nos dados numéricos fornecidos — nunca invente temperatura, chuva, " +
  "nível de rio, alerta ou estação. Nunca afirme algo como medição observada se o dado for " +
  "previsão. Responda em português do Brasil, no máximo 3 frases objetivas, tom informativo " +
  "e sem alarmismo desnecessário, voltado a ajudar a decisão prática de quem mora na região.";

function buildPrompt(region: string, snapshot: RegionSnapshot): string {
  const { weather, forecast, river, alerts } = snapshot;
  const today = forecast[0];
  const lines = [
    `Região: ${region}.`,
    `Agora: ${conditionLabel(weather.condition)}, ${weather.temperatureC ?? "sem dado"}°C ` +
      `(sensação ${weather.feelsLikeC ?? "sem dado"}°C), tendência ${weather.trend}.`,
    `Chuva últimas 24h: ${weather.rain24hMm ?? "sem dado"} mm. Vento: ${weather.windSpeedKmh ?? "sem dado"} km/h, ` +
      `rajadas até ${weather.windGustKmh ?? "sem dado"} km/h.`,
  ];
  if (today) {
    lines.push(
      `Previsão de hoje: máx ${today.temperatureMaxC ?? "?"}°C / mín ${today.temperatureMinC ?? "?"}°C, ` +
        `${today.precipitationProbabilityMaxPct ?? 0}% de chance de chuva, acumulado previsto ${today.precipitationSumMm ?? 0} mm.`
    );
  }
  if (river) {
    lines.push(
      `Rio ${river.riverName}: nível ${river.levelM ?? "sem dado"} m, tendência ${river.levelTrend}, ` +
        `nível de atenção interno do VIGIA: ${river.vigiaAttentionLevel}.`
    );
  }
  if (alerts.length > 0) {
    lines.push(`Alertas oficiais ativos: ${alerts.map((a) => a.title).join("; ")}.`);
  }
  return lines.join("\n");
}

export async function getRegionInsight(
  regionSlug: string,
  regionLabel: string,
  snapshot: RegionSnapshot
): Promise<RegionInsight | null> {
  const cacheKey = `ai:insight:${regionSlug}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached) as RegionInsight;
  }

  const result = await generateWithNvidia([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildPrompt(regionLabel, snapshot) },
  ]);

  if (!result.ok) {
    // Nunca fabrica um insight — página funciona normalmente sem ele
    // (ver componente AIInsight, que trata `null` como estado vazio).
    if (result.reason !== "sem-chave") {
      logger.warn("falha ao gerar insight de IA (NVIDIA)", { regionSlug, reason: result.reason });
    }
    return null;
  }

  const insight: RegionInsight = {
    text: result.text,
    model: result.model,
    generatedAt: new Date().toISOString(),
  };
  await redis.set(cacheKey, JSON.stringify(insight), "EX", CACHE_TTL_SECONDS).catch(() => {});
  return insight;
}
