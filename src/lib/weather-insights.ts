import type { ForecastDay, HourlyForecastPoint, WeatherSnapshot } from "./providers/types";
import { conditionLabel } from "./weather-labels";

/**
 * "Assistente climático" do VIGIA — camada de interpretação 100%
 * determinística (sem IA, sem custo, sem latência) sobre dados que já
 * passaram pelo normalizer. Só descreve o que os números já dizem —
 * nunca inventa condição, hora ou valor que não esteja em `hourly`.
 * Se um campo vier `null` (provider não informou), a regra
 * correspondente simplesmente não dispara — nunca um "sem dado"
 * mascarado de recomendação.
 */

const SP_TZ = "America/Sao_Paulo";
const HOUR_FMT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SP_TZ,
});

export function hourLabel(iso: string): string {
  return HOUR_FMT.format(new Date(iso));
}

/** Hora do dia (0-23) de um instante ISO, no fuso de São Paulo. */
export function spHourOfDay(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: SP_TZ,
  }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

/** Índice do ponto horário mais próximo de `now` dentro de `hourly`. */
export function findCurrentHourIndex(hourly: HourlyForecastPoint[], now: Date = new Date()): number {
  if (hourly.length === 0) return -1;
  let best = 0;
  let bestDiff = Infinity;
  hourly.forEach((h, i) => {
    const diff = Math.abs(new Date(h.t).getTime() - now.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

export type WeatherEventKind =
  | "chuva"
  | "chuva-proxima"
  | "temp-max"
  | "temp-cai"
  | "vento"
  | "janela-sol"
  | "anoitecer"
  | "visibilidade";

export type WeatherEvent = {
  id: string;
  kind: WeatherEventKind;
  title: string;
  timeLabel: string;
  atISO: string;
};

/** Eventos relevantes do dia, ordenados cronologicamente. */
export function generateDayEvents(today: ForecastDay): WeatherEvent[] {
  const hourly = today.hourly;
  if (hourly.length === 0) return [];

  const events: WeatherEvent[] = [];

  // Chuva chegando: primeiro horário com probabilidade >= 50%.
  const rainStart = hourly.find((h) => (h.precipitationProbabilityPct ?? 0) >= 50);
  if (rainStart) {
    events.push({
      id: "chuva",
      kind: "chuva",
      title: "Chuva prevista",
      timeLabel: hourLabel(rainStart.t),
      atISO: rainStart.t,
    });
  }

  // Temperatura máxima do dia.
  const withTemp = hourly.filter((h): h is HourlyForecastPoint & { temperatureC: number } => h.temperatureC !== null);
  if (withTemp.length > 0) {
    const maxPoint = withTemp.reduce((a, b) => (b.temperatureC > a.temperatureC ? b : a));
    events.push({
      id: "temp-max",
      kind: "temp-max",
      title: "Temperatura máxima",
      timeLabel: hourLabel(maxPoint.t),
      atISO: maxPoint.t,
    });

    // Queda de temperatura à noite: >= 4°C abaixo do pico, a partir das 18h.
    const evening = hourly.filter((h) => spHourOfDay(h.t) >= 18 && h.temperatureC !== null);
    const drop = evening.find((h) => maxPoint.temperatureC - (h.temperatureC as number) >= 4);
    if (drop) {
      events.push({
        id: "temp-cai",
        kind: "temp-cai",
        title: "Temperatura cai à noite",
        timeLabel: `a partir das ${spHourOfDay(drop.t)}h`,
        atISO: drop.t,
      });
    }
  }

  // Vento aumentando pelo menos 15 km/h em relação ao início do dia.
  const withWind = hourly.filter((h): h is HourlyForecastPoint & { windSpeedKmh: number } => h.windSpeedKmh !== null);
  if (withWind.length > 1) {
    const base = withWind[0].windSpeedKmh;
    const jump = withWind.find((h) => h.windSpeedKmh - base >= 15);
    if (jump) {
      events.push({
        id: "vento",
        kind: "vento",
        title: "Vento aumentando",
        timeLabel: hourLabel(jump.t),
        atISO: jump.t,
      });
    }
  }

  // Melhor janela de sol (ver getBestWindow).
  const best = getBestWindow(today);
  if (best) {
    events.push({
      id: "janela-sol",
      kind: "janela-sol",
      title: "Melhor janela para sair",
      timeLabel: `${hourLabel(best.startISO)}–${hourLabel(best.endISO)}`,
      atISO: best.startISO,
    });
  }

  // Visibilidade reduzida (nevoeiro/neblina) pela manhã.
  const lowVisibility = hourly.find(
    (h) => spHourOfDay(h.t) <= 9 && h.visibilityM !== null && h.visibilityM < 2000
  );
  if (lowVisibility) {
    events.push({
      id: "visibilidade",
      kind: "visibilidade",
      title: "Visibilidade reduzida",
      timeLabel: hourLabel(lowVisibility.t),
      atISO: lowVisibility.t,
    });
  }

  if (today.sunset) {
    events.push({
      id: "anoitecer",
      kind: "anoitecer",
      title: "Anoitecer",
      timeLabel: hourLabel(today.sunset),
      atISO: today.sunset,
    });
  }

  return events.sort((a, b) => new Date(a.atISO).getTime() - new Date(b.atISO).getTime());
}

/**
 * Maior janela contínua entre 6h–19h com baixa chance de chuva
 * (<20%) e temperatura amena (>= 15°C) — a "melhor hora para sair".
 * Retorna `null` se nenhuma hora do dia atender aos dois critérios.
 */
export function getBestWindow(
  today: ForecastDay
): { startISO: string; endISO: string; avgTempC: number | null } | null {
  const daytime = today.hourly.filter((h) => {
    const hr = spHourOfDay(h.t);
    return hr >= 6 && hr <= 19;
  });

  let bestRun: HourlyForecastPoint[] = [];
  let currentRun: HourlyForecastPoint[] = [];

  const flush = () => {
    if (currentRun.length > bestRun.length) bestRun = currentRun;
    currentRun = [];
  };

  for (const h of daytime) {
    const okRain = (h.precipitationProbabilityPct ?? 0) < 20;
    const okTemp = h.temperatureC === null || h.temperatureC >= 15;
    if (okRain && okTemp) {
      currentRun.push(h);
    } else {
      flush();
    }
  }
  flush();

  if (bestRun.length < 2) return null;

  const temps = bestRun.map((h) => h.temperatureC).filter((t): t is number => t !== null);
  return {
    startISO: bestRun[0].t,
    endISO: bestRun[bestRun.length - 1].t,
    avgTempC: temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
  };
}

export type GoNowAdvice = {
  tone: "tranquilo" | "atencao" | "indefinido";
  headline: string;
  detail: string;
};

/**
 * "Se você for sair agora" — olha a condição atual + as próximas 2h
 * de `hourly` (o ponto mais próximo do agora em diante) e resume em
 * uma recomendação prática. Nunca afirma algo que os dados não
 * sustentam: sem `hourly`, retorna tom "indefinido".
 */
export function getGoNowAdvice(weather: WeatherSnapshot, today: ForecastDay): GoNowAdvice {
  const idx = findCurrentHourIndex(today.hourly);
  if (idx === -1) {
    return {
      tone: "indefinido",
      headline: "Sem dados horários agora",
      detail: "Não temos previsão hora a hora suficiente para recomendar o melhor momento de sair.",
    };
  }

  const nextTwoHours = today.hourly.slice(idx, idx + 3);
  const maxRainProb = Math.max(0, ...nextTwoHours.map((h) => h.precipitationProbabilityPct ?? 0));
  const isRainingNow = weather.condition?.startsWith("chuva") || weather.condition === "tempestade";

  if (isRainingNow) {
    return {
      tone: "atencao",
      headline: "Está chovendo agora",
      detail: `${conditionLabel(weather.condition)} em curso — leve capa de chuva ou guarda-chuva se for sair.`,
    };
  }

  if (maxRainProb >= 60) {
    return {
      tone: "atencao",
      headline: "Chuva forte a caminho",
      detail: "Alta chance de chuva nas próximas horas. Se puder, espere um pouco antes de sair.",
    };
  }

  if (maxRainProb >= 30) {
    return {
      tone: "atencao",
      headline: "Pode chover mais tarde",
      detail: "Leve um guarda-chuva por precaução — a chance de chuva aumenta ao longo do dia.",
    };
  }

  return {
    tone: "tranquilo",
    headline: "Pode sair tranquilo",
    detail:
      weather.temperatureC !== null
        ? `${weather.temperatureC}° agora, ${conditionLabel(weather.condition).toLowerCase()} e sem chuva à vista no curto prazo.`
        : "Sem chuva à vista no curto prazo.",
  };
}

export type DaySummaryBlock = { label: string; text: string };

/**
 * Resumo por período do dia (manhã/tarde/noite), a partir da média de
 * condição/temperatura/chuva de cada bloco de horas.
 */
export function getDaySummary(today: ForecastDay): DaySummaryBlock[] {
  const blocks: { label: string; range: [number, number] }[] = [
    { label: "Manhã", range: [6, 11] },
    { label: "Tarde", range: [12, 17] },
    { label: "Noite", range: [18, 23] },
  ];

  return blocks
    .map(({ label, range }) => {
      const hours = today.hourly.filter((h) => {
        const hr = spHourOfDay(h.t);
        return hr >= range[0] && hr <= range[1];
      });
      if (hours.length === 0) return null;

      const rainProbs = hours.map((h) => h.precipitationProbabilityPct ?? 0);
      const maxRain = Math.max(...rainProbs);
      const temps = hours.map((h) => h.temperatureC).filter((t): t is number => t !== null);
      const avgTemp = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null;

      let text: string;
      if (maxRain >= 50) {
        text = `Chuva provável${avgTemp !== null ? `, em torno de ${avgTemp}°` : ""}.`;
      } else if (maxRain >= 20) {
        text = `Chance de pancada isolada${avgTemp !== null ? `, perto de ${avgTemp}°` : ""}.`;
      } else {
        text = `Sem chuva prevista${avgTemp !== null ? `, perto de ${avgTemp}°` : ""}.`;
      }

      return { label, text };
    })
    .filter((b): b is DaySummaryBlock => b !== null);
}

/** Linha única do hero — "Manhã agradável, chuva chegando no fim da tarde." */
export function getHeroSummary(today: ForecastDay): string {
  const events = generateDayEvents(today);
  const rain = events.find((e) => e.kind === "chuva");
  const drop = events.find((e) => e.kind === "temp-cai");
  const best = events.find((e) => e.kind === "janela-sol");

  if (rain && spHourOfDay(rain.atISO) >= 15) {
    return `Dia tranquilo até mais tarde, chuva chegando por volta das ${hourLabel(rain.atISO)}.`;
  }
  if (rain) {
    return `Chuva prevista a partir das ${hourLabel(rain.atISO)} — organize o dia com isso em mente.`;
  }
  if (drop) {
    return `Dia ameno, mas a temperatura cai ${drop.timeLabel} — separe um casaco para a noite.`;
  }
  if (best) {
    return `Boa janela para sair entre ${hourLabel(best.atISO)} e depois — sem chuva à vista.`;
  }
  return `${conditionLabel(today.condition)} ao longo do dia, sem eventos relevantes previstos.`;
}
