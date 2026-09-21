/**
 * Contratos de dados do VIGIA.
 *
 * IMPORTANTE: estes tipos são o contrato que os componentes de UI
 * conhecem. Componentes NUNCA devem depender do formato bruto de
 * um provider externo (Open-Meteo, INMET, ANA, CEMADEN, etc). Um
 * adapter real, na FASE 2, deve produzir exatamente esta forma.
 *
 * Todo dado carrega proveniência (`Provenance`) e uma `nature`
 * explícita para nunca confundir observação, previsão, simulação
 * e alerta oficial (ver <data_semantics> do VIGIA_MASTER_PROMPT).
 */

export type DataNature = "observado" | "previsto" | "simulado" | "oficial";

export type ProviderStatus = "ok" | "degradado" | "indisponivel" | "stale";

export type Provenance = {
  /** Nome do provedor/fonte de dado (ex: "Open-Meteo", "ANA HidroWebService"). */
  source: string;
  /** Estação/ponto de coleta quando aplicável. */
  station?: string;
  /** Momento em que o dado foi efetivamente observado/gerado. */
  observedAt: string; // ISO 8601
  /** Momento em que o VIGIA buscou/ingeriu o dado. */
  fetchedAt: string; // ISO 8601
  /** Até quando uma previsão/estimativa é considerada válida. */
  validUntil?: string; // ISO 8601
  nature: DataNature;
  status: ProviderStatus;
};

export type Trend = "subindo" | "descendo" | "estavel" | "indefinido";

export type WeatherSnapshot = {
  temperatureC: number | null;
  feelsLikeC: number | null;
  condition:
    | "ceu-limpo"
    | "parcialmente-nublado"
    | "nublado"
    | "chuva-fraca"
    | "chuva-moderada"
    | "chuva-forte"
    | "tempestade"
    | "nevoeiro"
    | null;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirectionDeg: number | null;
  pressureHpa: number | null;
  rain1hMm: number | null;
  rain24hMm: number | null;
  cloudCoverPct: number | null;
  trend: Trend;
  provenance: Provenance;
};

export type RiverSnapshot = {
  riverName: string;
  levelM: number | null;
  levelTrend: Trend;
  flowM3s: number | null;
  stationName: string | null;
  /** Nível de atenção INTERNO do VIGIA — nunca é "alerta oficial". */
  vigiaAttentionLevel: "normal" | "observacao" | "atencao" | "critico";
  /** Histórico de nível dos últimos 7 dias, para consulta sob demanda
   * (Nível 3 da hierarquia de informação — não exibido por padrão). */
  history7d: TimeseriesPoint[];
  provenance: Provenance;
};

export type OfficialAlert = {
  id: string;
  title: string;
  severity: "info" | "atencao" | "perigo" | "perigo-potencial";
  issuingAuthority: string;
  summary: string;
  issuedAt: string;
  expiresAt: string | null;
  sourceUrl: string | null;
};

export type StationInfo = {
  id: string;
  name: string;
  type: "meteorologica" | "fluviometrica" | "pluviometrica";
  network: string;
  lat: number;
  lng: number;
  status: ProviderStatus;
  lastReportAt: string | null;
};

export type TimeseriesPoint = { t: string; v: number | null };

/**
 * Um ponto horário dentro do detalhamento de um dia de previsão.
 * Todos os campos são `previsto` (mesma proveniência do `ForecastDay`
 * que os contém) — nunca observação.
 */
export type HourlyForecastPoint = {
  t: string; // ISO 8601
  temperatureC: number | null;
  feelsLikeC: number | null;
  precipitationMm: number | null;
  precipitationProbabilityPct: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirectionDeg: number | null;
  humidityPct: number | null;
  pressureHpa: number | null;
  cloudCoverPct: number | null;
  dewPointC: number | null;
  visibilityM: number | null;
  uvIndex: number | null;
  condition: WeatherSnapshot["condition"];
};

/**
 * Um dia da faixa de previsão de ~7 dias (Nível 2 da hierarquia de
 * informação). `hourly` é o detalhamento que só aparece quando o
 * usuário expande o dia (Nível 3) — sempre populado aqui (o custo de
 * já vir na resposta é pequeno e evita uma segunda ida ao servidor),
 * mas a UI só o renderiza sob demanda.
 */
export type ForecastDay = {
  date: string; // YYYY-MM-DD, fuso America/Sao_Paulo
  condition: WeatherSnapshot["condition"];
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  precipitationProbabilityMaxPct: number | null;
  precipitationSumMm: number | null;
  windSpeedMaxKmh: number | null;
  windGustMaxKmh: number | null;
  uvIndexMax: number | null;
  sunrise: string | null; // ISO 8601
  sunset: string | null; // ISO 8601
  hourly: HourlyForecastPoint[];
  provenance: Provenance;
};

export type RegionSnapshot = {
  regionSlug: string;
  weather: WeatherSnapshot;
  forecast: ForecastDay[];
  river: RiverSnapshot | null;
  alerts: OfficialAlert[];
  stations: StationInfo[];
  sparkline: TimeseriesPoint[];
};
