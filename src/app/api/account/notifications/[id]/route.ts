import { NextResponse } from "next/server";
import { requireUser } from "@/server/lib/require-user";
import { jsonError } from "@/server/lib/http";
import { markNotificationRead } from "@/server/account/repository";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);

  const { id } = await params;
  const updated = await markNotificationRead(user.id, id);
  if (!updated) return jsonError("not_found", "Notificação não encontrada.", 404);

  return NextResponse.json({ ok: true });
}
