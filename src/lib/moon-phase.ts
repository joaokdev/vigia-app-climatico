/**
 * Fase da Lua por cálculo astronômico direto (sem API externa —
 * determinístico e verificável). Usa a duração média do mês sinódico
 * (29.530588853 dias) a partir de uma lua nova de referência
 * conhecida (2000-01-06 18:14 UTC, valor de referência astronômico
 * padrão, usado por várias implementações de referência do mesmo
 * cálculo).
 *
 * Precisão: ±1 dia em relação a efemérides oficiais — suficiente para
 * o uso deste app (referência agronômica/cultural), não para
 * navegação ou astronomia de precisão.
 */

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

export type MoonPhaseKey =
  | "nova"
  | "crescente-1"
  | "quarto-crescente"
  | "crescente-2"
  | "cheia"
  | "minguante-1"
  | "quarto-minguante"
  | "minguante-2";

export const MOON_PHASE_LABEL: Record<MoonPhaseKey, string> = {
  nova: "Lua nova",
  "crescente-1": "Crescente côncava",
  "quarto-crescente": "Quarto crescente",
  "crescente-2": "Crescente gibosa",
  cheia: "Lua cheia",
  "minguante-1": "Minguante gibosa",
  "quarto-minguante": "Quarto minguante",
  "minguante-2": "Minguante côncava",
};

export type MoonPhaseResult = {
  phase: MoonPhaseKey;
  /** 0 a 1 — fração do mês sinódico decorrida. */
  age: number;
  /** 0 a 1 — fração da face iluminada (aprox.). */
  illuminationFraction: number;
};

/**
 * Tradição de plantio associada a cada fase — cultura popular rural
 * brasileira (calendários de agricultor/almanaques), SEM respaldo
 * científico controlado. Separado explicitamente da fase em si (que é
 * astronomia calculada) — ver ATUALIZACAO_DO_VIGIA.md §15.
 */
export const MOON_PLANTING_TRADITION: Record<MoonPhaseKey, string> = {
  nova: "Tradicionalmente evitada para semeadura; associada a repouso da terra.",
  "crescente-1": "Segundo a tradição, favorável para hortaliças de folha (alface, couve, repolho).",
  "quarto-crescente": "Segundo a tradição, favorável para hortaliças de folha (alface, couve, repolho).",
  "crescente-2": "Segundo a tradição, transição favorável para frutos que amadurecem rápido.",
  cheia: "Segundo a tradição, favorável para plantas de fruto (tomate, pepino, feijão, milho).",
  "minguante-1": "Segundo a tradição, favorável para tubérculos e raízes (batata, cenoura, mandioca).",
  "quarto-minguante": "Segundo a tradição, favorável para tubérculos e raízes (batata, cenoura, mandioca).",
  "minguante-2": "Tradicionalmente associada a poda, colheita e controle de pragas, não a semeadura.",
};

export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  const daysSinceKnownNewMoon = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cyclePosition = daysSinceKnownNewMoon / SYNODIC_MONTH_DAYS;
  const age = cyclePosition - Math.floor(cyclePosition); // 0..1

  const illuminationFraction = (1 - Math.cos(2 * Math.PI * age)) / 2;

  let phase: MoonPhaseKey;
  if (age < 0.02 || age >= 0.98) phase = "nova";
  else if (age < 0.24) phase = "crescente-1";
  else if (age < 0.26) phase = "quarto-crescente";
  else if (age < 0.49) phase = "crescente-2";
  else if (age < 0.51) phase = "cheia";
  else if (age < 0.74) phase = "minguante-1";
  else if (age < 0.76) phase = "quarto-minguante";
  else phase = "minguante-2";

  return { phase, age, illuminationFraction };
}
