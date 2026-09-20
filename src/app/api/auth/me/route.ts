import { NextResponse } from "next/server";
import { readSessionCookie } from "@/server/auth/session-cookie";
import { getSessionUser } from "@/server/auth/service";
import { jsonError } from "@/server/lib/http";

export async function GET() {
  const token = await readSessionCookie();
  if (!token) return jsonError("unauthenticated", "Não autenticado.", 401);

  const user = await getSessionUser(token);
  if (!user) return jsonError("unauthenticated", "Sessão inválida ou expirada.", 401);

  return NextResponse.json({ user });
}
