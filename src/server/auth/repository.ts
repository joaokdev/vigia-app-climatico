import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "../db/client";
import { users, otpCodes, sessions } from "../db/schema";

export type NewUser = {
  name: string;
  email: string;
  passwordHash: string;
};

export async function findUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function findUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function insertUser(input: NewUser) {
  const [row] = await db.insert(users).values(input).returning();
  return row;
}

export async function updateUserCredentials(
  id: string,
  input: { name?: string; passwordHash?: string }
) {
  const [row] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function markEmailVerified(id: string) {
  const [row] = await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return row;
}

export async function updatePasswordHash(id: string, passwordHash: string) {
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));
}

/* ---------------------------------------------------------------- */

export async function insertOtpCode(input: {
  userId: string;
  purpose: "email_verification" | "password_reset";
  codeHash: string;
  expiresAt: Date;
}) {
  const [row] = await db.insert(otpCodes).values(input).returning();
  return row;
}

/** Último código não consumido e ainda dentro da validade para o par usuário+finalidade. */
export async function findActiveOtp(
  userId: string,
  purpose: "email_verification" | "password_reset"
) {
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  return row ?? null;
}

export async function incrementOtpAttempts(id: string) {
  // Incremento atômico no banco (attempts = attempts + 1), não
  // "leia o valor, some 1 em memória, grave" — isso evitaria uma
  // condição de corrida real se duas tentativas chegassem quase
  // juntas (ex: usuário clicando "verificar" duas vezes rápido).
  await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(eq(otpCodes.id, id));
}

export async function consumeOtp(id: string) {
  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, id));
}

/* ---------------------------------------------------------------- */

export async function insertSession(input: {
  id: string;
  userId: string;
  expiresAt: Date;
  userAgent?: string | null;
}) {
  const [row] = await db.insert(sessions).values(input).returning();
  return row;
}

export async function findSessionWithUser(token: string) {
  const [row] = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function deleteAllUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
