import { env } from "./env";

type LogFields = Record<string, unknown>;

/**
 * Logger estruturado mínimo — sem dependência externa (pino/winston
 * seriam overkill para o volume atual). Em produção, uma linha JSON
 * por evento (fácil de indexar em qualquer coletor de log: Vercel,
 * Datadog, CloudWatch etc. todos entendem JSON por linha). Em dev,
 * texto legível no terminal.
 *
 * Isto NÃO é uma solução de observabilidade completa (sem tracing,
 * sem métricas, sem correlação de request id ainda) — é o piso que
 * torna os logs pesquisáveis/filtráveis, que é o que faltava.
 */
function emit(level: "info" | "warn" | "error", message: string, fields?: LogFields) {
  const entry = { level, message, time: new Date().toISOString(), ...fields };

  if (env.NODE_ENV === "production") {
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    return;
  }

  const prefix = `[${level.toUpperCase()}] ${message}`;
  const extra = fields && Object.keys(fields).length ? fields : undefined;
  if (level === "error") console.error(prefix, extra ?? "");
  else if (level === "warn") console.warn(prefix, extra ?? "");
  else console.log(prefix, extra ?? "");
}

export const logger = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
