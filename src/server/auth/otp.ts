import { randomInt, createHash } from "node:crypto";

export const OTP_LENGTH = 4;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 24; // mesmo valor do timer já existente no front

/** Gera um código numérico de 4 dígitos usando um CSPRNG (não Math.random). */
export function generateOtpCode(): string {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

/**
 * Um código de 4 dígitos tem só 10.000 combinações — nenhum hash torna
 * isso resistente a força bruta sozinho. O que protege de verdade é
 * `attempts`/`maxAttempts` e `expiresAt` no service. O hash aqui existe
 * para que um vazamento do banco não exponha o código em texto puro,
 * não como defesa primária. SHA-256 simples é suficiente para esse
 * papel (ao contrário de senha, não há necessidade de custo
 * computacional alto — o código já expira em minutos).
 */
export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyOtpCode(hash: string, code: string): boolean {
  return hashOtpCode(code) === hash;
}
