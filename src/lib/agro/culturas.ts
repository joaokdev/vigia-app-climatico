/**
 * Referência agronômica GERAL para culturas comuns na região (clima
 * subtropical de altitude, Köppen Cfb — União da Vitória, Cruz
 * Machado, Bituruna, Inácio Martins).
 *
 * IMPORTANTE — o que isto é e o que não é:
 * - As faixas de temperatura e os meses típicos vêm de conhecimento
 *   agronômico/horticultural amplamente estabelecido (necessidade
 *   térmica e sensibilidade a geada de cada espécie), não de uma
 *   fonte fabricada.
 * - Isto NÃO é o zoneamento agrícola de risco climático oficial (que
 *   é por município e por cultivar, definido em portaria do MAPA) nem
 *   substitui a orientação do IDR-Paraná (ex-IAPAR/EMATER-PR,
 *   idrparana.pr.gov.br) para uma decisão de plantio real.
 * - Ver ATUALIZACAO_DO_VIGIA.md §14: "fontes de referência devem ser
 *   verificadas durante a implementação" — isto foi verificado como
 *   direção geral, não como calendário oficial município-a-município,
 *   e o app deixa isso explícito na UI.
 */

export type CropKey =
  | "milho"
  | "feijao"
  | "batata"
  | "mandioca"
  | "tomate"
  | "pepino"
  | "alface"
  | "repolho"
  | "cenoura"
  | "cebola";

export type CropReference = {
  key: CropKey;
  name: string;
  /** Meses (1–12) em que o plantio é tipicamente indicado na região. */
  typicalPlantingMonths: number[];
  idealTempMinC: number;
  idealTempMaxC: number;
  frostSensitive: boolean;
  /** Faixa aproximada de chuva semanal desejável, em mm. */
  idealWeeklyRainMm: { min: number; max: number };
  category: "graos" | "hortalica-fruto" | "hortalica-folha" | "raiz-tuberculo";
};

export const CROP_REFERENCE: CropReference[] = [
  {
    key: "milho",
    name: "Milho",
    typicalPlantingMonths: [8, 9, 10, 11],
    idealTempMinC: 15,
    idealTempMaxC: 30,
    frostSensitive: true,
    idealWeeklyRainMm: { min: 15, max: 60 },
    category: "graos",
  },
  {
    key: "feijao",
    name: "Feijão",
    typicalPlantingMonths: [8, 9, 10, 1, 2],
    idealTempMinC: 15,
    idealTempMaxC: 28,
    frostSensitive: true,
    idealWeeklyRainMm: { min: 15, max: 50 },
    category: "graos",
  },
  {
    key: "batata",
    name: "Batata",
    typicalPlantingMonths: [7, 8, 9, 2, 3],
    idealTempMinC: 10,
    idealTempMaxC: 24,
    frostSensitive: true,
    idealWeeklyRainMm: { min: 10, max: 40 },
    category: "raiz-tuberculo",
  },
  {
    key: "mandioca",
    name: "Mandioca",
    typicalPlantingMonths: [8, 9],
    idealTempMinC: 18,
    idealTempMaxC: 32,
    frostSensitive: false,
    idealWeeklyRainMm: { min: 10, max: 40 },
    category: "raiz-tuberculo",
  },
  {
    key: "tomate",
    name: "Tomate",
    typicalPlantingMonths: [8, 9, 10, 11],
    idealTempMinC: 18,
    idealTempMaxC: 28,
    frostSensitive: true,
    idealWeeklyRainMm: { min: 10, max: 35 },
    category: "hortalica-fruto",
  },
  {
    key: "pepino",
    name: "Pepino",
    typicalPlantingMonths: [9, 10, 11, 12],
    idealTempMinC: 18,
    idealTempMaxC: 30,
    frostSensitive: true,
    idealWeeklyRainMm: { min: 10, max: 35 },
    category: "hortalica-fruto",
  },
  {
    key: "alface",
    name: "Alface",
    typicalPlantingMonths: [3, 4, 5, 6, 7, 8],
    idealTempMinC: 8,
    idealTempMaxC: 22,
    frostSensitive: false,
    idealWeeklyRainMm: { min: 8, max: 30 },
    category: "hortalica-folha",
  },
  {
    key: "repolho",
    name: "Repolho",
    typicalPlantingMonths: [2, 3, 4, 5, 6, 7],
    idealTempMinC: 8,
    idealTempMaxC: 24,
    frostSensitive: false,
    idealWeeklyRainMm: { min: 8, max: 30 },
    category: "hortalica-folha",
  },
  {
    key: "cenoura",
    name: "Cenoura",
    typicalPlantingMonths: [2, 3, 4, 8, 9],
    idealTempMinC: 12,
    idealTempMaxC: 24,
    frostSensitive: false,
    idealWeeklyRainMm: { min: 8, max: 30 },
    category: "raiz-tuberculo",
  },
  {
    key: "cebola",
    name: "Cebola",
    typicalPlantingMonths: [4, 5, 6],
    idealTempMinC: 10,
    idealTempMaxC: 24,
    frostSensitive: false,
    idealWeeklyRainMm: { min: 8, max: 25 },
    category: "hortalica-folha",
  },
];
