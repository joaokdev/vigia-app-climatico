import { CROP_REFERENCE, type CropReference } from "@/lib/agro/culturas";
import type { RegionSnapshot } from "@/lib/providers/types";

/**
 * Classificador de janelas de plantio — regras determinísticas, NÃO
 * IA (ver ATUALIZACAO_DO_VIGIA.md §11 "Fallback": "o VIGIA deve
 * continuar funcionando com regras determinísticas"). Isto roda
 * sempre, com ou sem a camada de IA disponível, e é a base do card
 * "O que plantar agora" (§13).
 *
 * Nunca decide sozinho por dado inventado: usa apenas o que já está
 * no `RegionSnapshot` (clima atual + previsão de 7 dias real).
 */

export type PlantingStatus = "favoravel" | "atencao" | "fora-de-epoca";

export type PlantingOpportunity = {
  crop: CropReference;
  status: PlantingStatus;
  reasons: string[];
};

function averageForecastTemp(snapshot: RegionSnapshot): { min: number; max: number } | null {
  const next3 = snapshot.forecast.slice(0, 3);
  if (next3.length === 0) return null;
  const mins = next3.map((d) => d.temperatureMinC).filter((v): v is number => v !== null);
  const maxs = next3.map((d) => d.temperatureMaxC).filter((v): v is number => v !== null);
  if (mins.length === 0 || maxs.length === 0) return null;
  return {
    min: Math.min(...mins),
    max: Math.max(...maxs),
  };
}

function forecastRainMm(snapshot: RegionSnapshot): number | null {
  const next7 = snapshot.forecast.slice(0, 7);
  if (next7.length === 0) return null;
  const sums = next7.map((d) => d.precipitationSumMm).filter((v): v is number => v !== null);
  if (sums.length === 0) return null;
  return sums.reduce((a, b) => a + b, 0);
}

function classifyCrop(crop: CropReference, snapshot: RegionSnapshot, month: number): PlantingOpportunity {
  const reasons: string[] = [];
  const inSeason = crop.typicalPlantingMonths.includes(month);
  const tempRange = averageForecastTemp(snapshot);
  const weekRainMm = forecastRainMm(snapshot);
  const frostRisk = crop.frostSensitive && snapshot.forecast.slice(0, 3).some((d) => (d.temperatureMinC ?? 99) < 3);

  if (!inSeason) {
    return {
      crop,
      status: "fora-de-epoca",
      reasons: ["Fora da janela típica de plantio para esta região neste mês"],
    };
  }
  reasons.push("Dentro da época típica de plantio para a região neste mês");

  if (frostRisk) {
    return {
      crop,
      status: "atencao",
      reasons: [...reasons, "Risco de geada nos próximos dias — cultura sensível ao frio"],
    };
  }

  let tempOk = true;
  if (tempRange) {
    tempOk = tempRange.max >= crop.idealTempMinC - 3 && tempRange.min <= crop.idealTempMaxC + 5;
    reasons.push(
      tempOk
        ? "Temperatura prevista dentro da faixa adequada"
        : "Temperatura prevista fora da faixa ideal para esta cultura"
    );
  }

  let rainOk = true;
  if (weekRainMm !== null) {
    rainOk = weekRainMm >= crop.idealWeeklyRainMm.min * 0.4; // tolerância — irrigação pode compensar
    reasons.push(
      weekRainMm > crop.idealWeeklyRainMm.max
        ? "Chuva prevista acima do desejável — atenção a encharcamento"
        : rainOk
          ? "Chuva prevista deve fornecer umidade suficiente ao solo"
          : "Pouca chuva prevista — pode exigir irrigação"
    );
  }

  const status: PlantingStatus = tempOk && rainOk ? "favoravel" : "atencao";
  return { crop, status, reasons };
}

export function getPlantingOpportunities(snapshot: RegionSnapshot, at: Date = new Date()): PlantingOpportunity[] {
  const month = at.getMonth() + 1;
  return CROP_REFERENCE.map((crop) => classifyCrop(crop, snapshot, month)).sort((a, b) => {
    const order: Record<PlantingStatus, number> = { favoravel: 0, atencao: 1, "fora-de-epoca": 2 };
    return order[a.status] - order[b.status];
  });
}
