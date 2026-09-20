import { sql } from "drizzle-orm";
import { db } from "../db/client";

/**
 * Limpa todas as tabelas de aplicação entre suites de teste. TRUNCATE
 * ... CASCADE em vez de DELETE por tabela: mais rápido e não precisa
 * saber a ordem de dependência de foreign keys.
 *
 * NUNCA rodar isto fora de um banco de teste/dev — não há checagem de
 * ambiente aqui de propósito (mantém o helper simples); a
 * responsabilidade de apontar DATABASE_URL para um banco de teste é
 * de quem configura o ambiente (ver README, seção de testes).
 */
export async function cleanDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE
      notifications,
      otp_codes,
      sessions,
      users,
      weather_readings,
      river_readings,
      official_alerts,
      stations
    RESTART IDENTITY CASCADE
  `);
}
