import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "./password";
import { logger } from "../lib/logger";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  OTP_TTL_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "./otp";
import { generateSessionToken, SESSION_TTL_MS } from "./session-cookie";
import { sendEmail, otpEmailContent } from "./email";
import { redis } from "../db/redis";
import { env } from "../lib/env";
import * as repo from "./repository";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; retryAfterSeconds?: number };

const RESET_TOKEN_PREFIX = "pwreset:";
const RESEND_COOLDOWN_PREFIX = "otp-cooldown:";
const LOGIN_ATTEMPT_PREFIX = "login-attempts:";
// Janela deslizante simples (INCR + EXPIRE só no primeiro hit) — não é
// tão preciso quanto um sliding window de verdade, mas é o suficiente
// para conter brute force por e-mail sem adicionar dependência nova.
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}
function fail(code: string, message: string, retryAfterSeconds?: number): ServiceResult<never> {
  return { ok: false, code, message, retryAfterSeconds };
}

/** Nunca deixa o payload de sessão/usuário vazar o hash da senha para o cliente. */
function toPublicUser(user: { id: string; name: string; email: string; emailVerifiedAt: Date | null; favoriteRegionSlug: string | null; temperatureUnit: string; windUnit: string; notifyPush: boolean; notifyEmail: boolean; notifySms: boolean; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    favoriteRegionSlug: user.favoriteRegionSlug,
    preferences: {
      temperatureUnit: user.temperatureUnit as "celsius" | "fahrenheit",
      windUnit: user.windUnit as "kmh" | "ms",
    },
    notificationChannels: {
      push: user.notifyPush,
      email: user.notifyEmail,
      sms: user.notifySms,
    },
    memberSince: user.createdAt.toISOString(),
  };
}

async function issueOtp(userId: string, email: string, purpose: "email_verification" | "password_reset") {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
  await repo.insertOtpCode({ userId, purpose, codeHash: hashOtpCode(code), expiresAt });
  const content = otpEmailContent(code, purpose);
  await sendEmail({ to: email, ...content });
  return { devCode: env.VIGIA_DEV_EXPOSE_OTP ? code : undefined };
}

async function createSessionFor(userId: string, userAgent?: string | null) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await repo.insertSession({ id: token, userId, expiresAt, userAgent });
  return { token, expiresAt };
}

/* ==================== REGISTER ==================== */

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await repo.findUserByEmail(input.email);

  if (existing && existing.emailVerifiedAt) {
    return fail("email_taken", "Este e-mail já tem uma conta. Tente entrar.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = existing
    ? await repo.updateUserCredentials(existing.id, { name: input.name, passwordHash })
    : await repo.insertUser({ name: input.name, email: input.email, passwordHash });

  const { devCode } = await issueOtp(user!.id, input.email, "email_verification");
  logger.info("cadastro iniciado, otp enviado", { email: input.email, userId: user!.id, resumed: !!existing });
  return ok({ email: input.email, devCode });
}

/* ==================== VERIFY OTP ==================== */

export async function verifyOtp(input: {
  email: string;
  code: string;
  purpose: "email_verification" | "password_reset";
  userAgent?: string | null;
}) {
  const user = await repo.findUserByEmail(input.email);
  if (!user) return fail("invalid_code", "Código inválido ou expirado.");

  const otp = await repo.findActiveOtp(user.id, input.purpose);
  if (!otp) return fail("invalid_code", "Código inválido ou expirado.");

  if (otp.attempts >= otp.maxAttempts) {
    logger.warn("otp bloqueado por excesso de tentativas", { email: input.email, userId: user.id, purpose: input.purpose });
    return fail("too_many_attempts", "Muitas tentativas. Peça um novo código.");
  }

  if (!verifyOtpCode(otp.codeHash, input.code)) {
    await repo.incrementOtpAttempts(otp.id);
    return fail("invalid_code", "Código incorreto.");
  }

  await repo.consumeOtp(otp.id);

  if (input.purpose === "email_verification") {
    const verified = await repo.markEmailVerified(user.id);
    const session = await createSessionFor(user.id, input.userAgent);
    return ok({
      kind: "session" as const,
      session,
      user: toPublicUser(verified!),
    });
  }

  // password_reset: não define a sessão nem a senha ainda — devolve um
  // ticket de curta duração que autoriza só a chamada de troca de
  // senha, para o cliente não precisar guardar o código em texto puro
  // entre as duas telas.
  const resetToken = randomBytes(32).toString("base64url");
  await redis.set(RESET_TOKEN_PREFIX + resetToken, user.id, "EX", 10 * 60);
  return ok({ kind: "reset_token" as const, resetToken });
}

/* ==================== RESEND OTP ==================== */

export async function resendOtp(input: { email: string; purpose: "email_verification" | "password_reset" }) {
  const user = await repo.findUserByEmail(input.email);
  // Resposta neutra: não confirma se o e-mail existe. Sem usuário,
  // finge sucesso (sem custo real de e-mail/OTP) para não vazar
  // enumeração de contas por esse endpoint.
  if (!user) return ok({ sent: true, devCode: undefined as string | undefined });

  const cooldownKey = RESEND_COOLDOWN_PREFIX + user.id + ":" + input.purpose;
  const ttl = await redis.ttl(cooldownKey);
  if (ttl > 0) {
    return fail("cooldown", "Aguarde antes de pedir um novo código.", ttl);
  }

  await redis.set(cooldownKey, "1", "EX", OTP_RESEND_COOLDOWN_SECONDS);
  const { devCode } = await issueOtp(user.id, input.email, input.purpose);
  return ok({ sent: true, devCode });
}

/* ==================== LOGIN ==================== */

// Hash "morto" com custo comparável a um hash real — usado quando o
// usuário não existe, para que o tempo de resposta de "e-mail não
// cadastrado" e "senha errada" seja parecido (dificulta enumeração de
// contas por timing). Não é proteção perfeita, mas é a defesa padrão
// de baixo custo para esse tipo de endpoint.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Y8L3sJ4XxK5X0V1qXwqjHqXwqjHqXwqjHqXwqjHqXwo";

export async function login(input: { email: string; password: string; userAgent?: string | null }) {
  // Limite por e-mail antes de tocar no banco/argon2 — contém brute
  // force de senha (o OTP já tem seu próprio limite em `attempts`,
  // mas login não tinha nenhum antes desta correção).
  const attemptsKey = LOGIN_ATTEMPT_PREFIX + input.email;
  const attempts = await redis.incr(attemptsKey);
  if (attempts === 1) await redis.expire(attemptsKey, LOGIN_WINDOW_SECONDS);
  if (attempts > LOGIN_MAX_ATTEMPTS) {
    const retryAfterSeconds = await redis.ttl(attemptsKey);
    logger.warn("login bloqueado: excesso de tentativas", { email: input.email });
    return fail(
      "too_many_attempts",
      "Muitas tentativas de login. Tente novamente mais tarde.",
      retryAfterSeconds > 0 ? retryAfterSeconds : LOGIN_WINDOW_SECONDS
    );
  }

  const user = await repo.findUserByEmail(input.email);

  const passwordOk = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, input.password);
  if (!user || !passwordOk) {
    logger.warn("login falhou: credenciais inválidas", { email: input.email });
    return fail("invalid_credentials", "E-mail ou senha incorretos.");
  }

  // Login bem-sucedido — libera o contador para não punir o próximo
  // ciclo de tentativas legítimas do mesmo usuário.
  await redis.del(attemptsKey);

  if (!user.emailVerifiedAt) {
    logger.warn("login recusado: e-mail não verificado", { email: input.email, userId: user.id });
    return fail("email_not_verified", "Confirme seu e-mail antes de entrar.");
  }

  const session = await createSessionFor(user.id, input.userAgent);
  logger.info("login bem-sucedido", { userId: user.id });
  return ok({ session, user: toPublicUser(user) });
}

/* ==================== LOGOUT / SESSION ==================== */

export async function logout(token: string) {
  await repo.deleteSession(token);
}

export async function getSessionUser(token: string) {
  const row = await repo.findSessionWithUser(token);
  if (!row) return null;
  return toPublicUser(row.user);
}

/* ==================== PASSWORD RESET ==================== */

export async function requestPasswordReset(input: { email: string }) {
  const user = await repo.findUserByEmail(input.email);
  let devCode: string | undefined;
  if (user && user.emailVerifiedAt) {
    const cooldownKey = RESEND_COOLDOWN_PREFIX + user.id + ":password_reset";
    const ttl = await redis.ttl(cooldownKey);
    if (ttl <= 0) {
      await redis.set(cooldownKey, "1", "EX", OTP_RESEND_COOLDOWN_SECONDS);
      devCode = (await issueOtp(user.id, input.email, "password_reset")).devCode;
    }
  }
  // A resposta HTTP em si é sempre neutra (ver route handler) — mesma
  // forma exista ou não o e-mail, com conta verificada ou não. O
  // devCode aqui só existe internamente para consistência com as
  // outras funções de emissão de OTP (registerUser/resendOtp) e para
  // ser testável; quem chama do lado de fora não expõe isso a menos
  // que VIGIA_DEV_EXPOSE_OTP esteja ligado (mesma regra de sempre).
  return ok({ requested: true, devCode });
}

export async function resetPassword(input: { resetToken: string; newPassword: string }) {
  const userId = await redis.get(RESET_TOKEN_PREFIX + input.resetToken);
  if (!userId) return fail("invalid_token", "Link/código expirado. Peça a recuperação novamente.");

  await redis.del(RESET_TOKEN_PREFIX + input.resetToken);
  const passwordHash = await hashPassword(input.newPassword);
  await repo.updatePasswordHash(userId, passwordHash);
  // Trocar a senha invalida todas as sessões existentes — se alguém
  // mais tinha acesso à conta, essa troca também os desloga.
  await repo.deleteAllUserSessions(userId);
  logger.info("senha redefinida, sessões anteriores revogadas", { userId });
  return ok({ reset: true });
}
