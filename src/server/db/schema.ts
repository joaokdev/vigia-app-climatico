import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  doublePrecision,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ============================================================
   AUTENTICAÇÃO E CONTA
   ============================================================ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),

  // Preferências — 1:1 com o usuário, colunas diretas em vez de tabela
  // separada (não há caso de uso hoje para consultá-las independente
  // do usuário; uma tabela própria só adicionaria um join sem benefício).
  favoriteRegionSlug: text("favorite_region_slug"),
  temperatureUnit: text("temperature_unit", { enum: ["celsius", "fahrenheit"] })
    .notNull()
    .default("celsius"),
  windUnit: text("wind_unit", { enum: ["kmh", "ms"] }).notNull().default("kmh"),
  notifyPush: boolean("notify_push").notNull().default(true),
  notifyEmail: boolean("notify_email").notNull().default(true),
  notifySms: boolean("notify_sms").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // Unicidade real vem da normalização em código (e-mail sempre
  // salvo em minúsculas antes do insert/update — ver
  // server/auth/service.ts). Um índice de expressão lower(email)
  // daria a mesma garantia direto no banco, mas exigiria escrever
  // toda query de busca também com lower(...); normalizar uma vez na
  // escrita é mais simples e já elimina "Joao@x.com" vs "joao@x.com".
  uniqueIndex("users_email_idx").on(t.email),
]);

export const otpPurposeEnum = pgEnum("otp_purpose", [
  "email_verification",
  "password_reset",
]);

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  purpose: otpPurposeEnum("purpose").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("otp_codes_user_purpose_idx").on(t.userId, t.purpose),
]);

export const sessions = pgTable("sessions", {
  // Token opaco (256 bits, gerado em código) — não é um JWT: revogar
  // uma sessão é um DELETE simples, sem lista de revogação separada.
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  index("sessions_user_idx").on(t.userId),
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("notifications_user_idx").on(t.userId, t.createdAt),
]);

/* ============================================================
   DADOS AMBIENTAIS
   Regiões (as 4 monitoradas) permanecem como constante em código
   (src/lib/data/regions.ts) — são metadados geográficos estáveis,
   não editáveis por usuário, sem necessidade de tabela própria hoje.
   ============================================================ */

export const stationTypeEnum = pgEnum("station_type", [
  "meteorologica",
  "fluviometrica",
  "pluviometrica",
]);

export const providerStatusEnum = pgEnum("provider_status", [
  "ok",
  "degradado",
  "indisponivel",
  "stale",
]);

export const dataNatureEnum = pgEnum("data_nature", [
  "observado",
  "previsto",
  "simulado",
  "oficial",
]);

export const stations = pgTable("stations", {
  id: uuid("id").primaryKey().defaultRandom(),
  regionSlug: text("region_slug").notNull(),
  name: text("name").notNull(),
  type: stationTypeEnum("type").notNull(),
  network: text("network").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  // Identificador da estação/ponto na API de origem (ex: id da ANA).
  // Nulo até termos uma integração real que o preencha.
  externalId: text("external_id"),
  status: providerStatusEnum("status").notNull().default("indisponivel"),
  lastReportAt: timestamp("last_report_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("stations_region_idx").on(t.regionSlug),
]);

/**
 * Cada linha é uma leitura de clima buscada de um provedor externo
 * para uma região. Serve dois papéis ao mesmo tempo: cache (evita
 * rebuscar a cada requisição) e histórico (as últimas N linhas por
 * região alimentam o sparkline/tendência) — uma tabela só, sem
 * duplicar o dado em "cache" + "histórico" separados.
 */
export const weatherReadings = pgTable("weather_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  regionSlug: text("region_slug").notNull(),
  temperatureC: doublePrecision("temperature_c"),
  feelsLikeC: doublePrecision("feels_like_c"),
  condition: text("condition"),
  humidityPct: doublePrecision("humidity_pct"),
  windSpeedKmh: doublePrecision("wind_speed_kmh"),
  windGustKmh: doublePrecision("wind_gust_kmh"),
  windDirectionDeg: doublePrecision("wind_direction_deg"),
  pressureHpa: doublePrecision("pressure_hpa"),
  rain1hMm: doublePrecision("rain_1h_mm"),
  rain24hMm: doublePrecision("rain_24h_mm"),
  cloudCoverPct: doublePrecision("cloud_cover_pct"),
  source: text("source").notNull(),
  nature: dataNatureEnum("nature").notNull().default("observado"),
  status: providerStatusEnum("status").notNull().default("ok"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("weather_readings_region_time_idx").on(t.regionSlug, t.observedAt),
]);

/** Mesmo papel de cache+histórico que weather_readings, para o rio. */
export const riverReadings = pgTable("river_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  regionSlug: text("region_slug").notNull(),
  riverName: text("river_name").notNull(),
  levelM: doublePrecision("level_m"),
  flowM3s: doublePrecision("flow_m3s"),
  stationName: text("station_name"),
  attentionLevel: text("attention_level", {
    enum: ["normal", "observacao", "atencao", "critico"],
  }).notNull().default("normal"),
  source: text("source").notNull(),
  nature: dataNatureEnum("nature").notNull().default("observado"),
  status: providerStatusEnum("status").notNull().default("indisponivel"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("river_readings_region_time_idx").on(t.regionSlug, t.observedAt),
]);

export const officialAlerts = pgTable("official_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  regionSlug: text("region_slug").notNull(),
  title: text("title").notNull(),
  severity: text("severity", {
    enum: ["info", "atencao", "perigo", "perigo-potencial"],
  }).notNull(),
  issuingAuthority: text("issuing_authority").notNull(),
  summary: text("summary").notNull(),
  sourceUrl: text("source_url"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("official_alerts_region_idx").on(t.regionSlug),
]);
