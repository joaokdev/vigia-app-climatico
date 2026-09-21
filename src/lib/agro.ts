import type { WeatherSnapshot } from "@/lib/providers/types";

/**
 * Condições de forrageamento de abelhas — calculadas a partir dos
 * mesmos dados meteorológicos reais já usados no resto do VIGIA
 * (nunca uma fonte de dado nova). Faixas de referência baseadas em
 * literatura apícola amplamente usada (ex.: material técnico do
 * SEBRAE/Embrapa sobre apicultura): abelhas operárias forrageiam bem
 * entre ~15°C e ~35°C, com vento fraco e sem chuva; fora dessas
 * faixas, reduzem ou interrompem a atividade.
 *
 * Isto é uma heurística prática, não uma métrica oficial — rotulada
 * como tal na UI.
 */
export type ForagingCondition = "favoravel" | "parcial" | "desfavoravel" | "indefinido";

export function evaluateForagingCondition(weather: WeatherSnapshot): {
  condition: ForagingCondition;
  reasons: string[];
} {
  const { temperatureC, windSpeedKmh, condition, rain1hMm } = weather;
  if (temperatureC === null || windSpeedKmh === null) {
    return { condition: "indefinido", reasons: ["Dados insuficientes no momento"] };
  }

  const reasons: string[] = [];
  let score = 0; // -1 por restrição, +0 neutro

  if (temperatureC < 12) {
    reasons.push("Temperatura abaixo de 12°C reduz a atividade de voo");
    score -= 1;
  } else if (temperatureC > 38) {
    reasons.push("Temperatura acima de 38°C tende a reduzir o forrageamento");
    score -= 1;
  } else if (temperatureC >= 18 && temperatureC <= 32) {
    reasons.push("Temperatura dentro da faixa mais favorável (18–32°C)");
  }

  if (windSpeedKmh > 25) {
    reasons.push("Vento acima de 25 km/h dificulta o voo das operárias");
    score -= 1;
  }

  if ((rain1hMm ?? 0) > 0 || condition === "chuva-moderada" || condition === "chuva-forte" || condition === "tempestade") {
    reasons.push("Chuva em curso interrompe o forrageamento");
    score -= 1;
  }

  if (reasons.length === 0) {
    reasons.push("Condições dentro dos parâmetros usuais de forrageamento");
  }

  const result: ForagingCondition = score <= -2 ? "desfavoravel" : score === -1 ? "parcial" : "favoravel";
  return { condition: result, reasons };
}

export const FORAGING_LABEL: Record<ForagingCondition, string> = {
  favoravel: "Favorável ao forrageamento",
  parcial: "Parcialmente favorável",
  desfavoravel: "Desfavorável ao forrageamento",
  indefinido: "Indefinido — dados insuficientes",
};

/**
 * Calendário regional de plantio — referência agronômica geral para o
 * Centro-Sul do Paraná (clima subtropical, altitude elevada), meses
 * aproximados de semeadura das culturas mais comuns na região das
 * quatro cidades monitoradas. Fonte: prática agronômica regional
 * amplamente divulgada por Emater-PR/Embrapa para essa mesorregião —
 * NÃO é uma recomendação técnica individualizada; janelas reais
 * variam por solo, altitude exata e ano-safra. Sempre validar com um
 * agrônomo local antes de decidir plantio.
 */
export const REGIONAL_PLANTING_CALENDAR = [
  { crop: "Milho (safra de verão)", window: "Ago–Out", notes: "Após risco de geada tardia baixar" },
  { crop: "Soja", window: "Out–Dez", notes: "Janela clássica da região Sul" },
  { crop: "Feijão (1ª safra)", window: "Ago–Out", notes: "Evitar excesso de umidade na floração" },
  { crop: "Feijão (2ª safra/\"das águas\")", window: "Jan–Fev", notes: "Depende de chuva regular" },
  { crop: "Trigo", window: "Abr–Jun", notes: "Cultura de inverno, região tradicionalmente triticultora" },
  { crop: "Erva-mate (mudas)", window: "Set–Nov", notes: "Cultura histórica da região de União da Vitória" },
  { crop: "Hortaliças de folha", window: "Quase todo o ano", notes: "Evitar picos de geada (Jun–Jul) sem proteção" },
] as const;
