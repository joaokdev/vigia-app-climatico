import { NextResponse } from "next/server";
import { requireUser } from "@/server/lib/require-user";
import { jsonError } from "@/server/lib/http";
import { listNotifications, markAllNotificationsRead } from "@/server/account/repository";

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);

  const rows = await listNotifications(user.id);
  return NextResponse.json({
    notifications: rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function PATCH() {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);

  await markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
