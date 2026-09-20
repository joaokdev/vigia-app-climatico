import Redis from "ioredis";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const globalForRedis = globalThis as unknown as { __vigiaRedis?: Redis };

export const redis =
  globalForRedis.__vigiaRedis ??
  new Redis(env.REDIS_URL, {
    // lazyConnect: só conecta no primeiro comando de verdade (ex: no
    // primeiro OTP/reset), não na hora em que o módulo é importado.
    // Sem isto, `next build`/"Collecting page data" importa este
    // módulo transitivamente ao gerar páginas estáticas e tenta
    // conectar num Redis que nem precisa estar no ar nesse momento —
    // gerando ECONNREFUSED barulhento no log de build sem nenhum
    // comando real ter sido executado.
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

// Sem um listener de "error", o ioredis apenas loga
// "Unhandled error event" cru (sem contexto) a cada falha de conexão —
// aqui trocamos isso pelo logger estruturado do app, mantendo o
// mesmo comportamento (não derruba o processo; a falha aparece como
// erro na chamada que efetivamente usar o Redis).
redis.on("error", (err) => {
  logger.error("erro de conexão com o Redis", { error: err.message });
});

if (env.NODE_ENV !== "production") {
  globalForRedis.__vigiaRedis = redis;
}
