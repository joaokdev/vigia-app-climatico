import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "../lib/env";

export const SESSION_TTL_MS = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Token opaco de 256 bits — não carrega dados, só identifica a linha em `sessions`. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(env.SESSION_COOKIE_NAME);
}

export async function readSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(env.SESSION_COOKIE_NAME)?.value;
}
