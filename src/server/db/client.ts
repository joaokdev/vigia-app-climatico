import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../lib/env";
import * as schema from "./schema";

/**
 * Pool de conexão único, reaproveitado entre requisições (inclusive em
 * dev com hot-reload do Next, via cache no `globalThis` — sem isso, cada
 * reload criaria um pool novo e vazaria conexões até esgotar o limite
 * do Postgres).
 */
const globalForDb = globalThis as unknown as { __vigiaPgPool?: Pool };

export const pool =
  globalForDb.__vigiaPgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.__vigiaPgPool = pool;
}

export const db = drizzle(pool, { schema });
