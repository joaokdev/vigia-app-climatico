import { NextResponse } from "next/server";
import { readSessionCookie, clearSessionCookie } from "@/server/auth/session-cookie";
import { logout } from "@/server/auth/service";

export async function POST() {
  const token = await readSessionCookie();
  if (token) await logout(token);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
