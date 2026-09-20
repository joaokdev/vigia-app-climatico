import { readSessionCookie } from "../auth/session-cookie";
import { getSessionUser } from "../auth/service";

/** Retorna o usuário autenticado, ou null se não houver sessão válida. */
export async function requireUser() {
  const token = await readSessionCookie();
  if (!token) return null;
  return getSessionUser(token);
}

export type RequiredUser = NonNullable<Awaited<ReturnType<typeof requireUser>>>;
