import Redis from "ioredis";
import { env } from "../lib/env";

const globalForRedis = globalThis as unknown as { __vigiaRedis?: Redis };

export const redis =
  globalForRedis.__vigiaRedis ??
  new Redis(env.REDIS_URL, {
    // Não trava a inicialização do processo esperando o Redis subir;
    // falhas de comando aparecem como erro na chamada, não como
    // travamento silencioso do boot.
    lazyConnect: false,
    maxRetriesPerRequest: 2,
  });

if (env.NODE_ENV !== "production") {
  globalForRedis.__vigiaRedis = redis;
}
