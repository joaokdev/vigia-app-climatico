import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { loginSchema } from "@/server/auth/schema";
import { login } from "@/server/auth/service";
import { setSessionCookie } from "@/server/auth/session-cookie";

export async function POST(req: Request) {
  const parsed = await parseBody(req, loginSchema);
  if (parsed.error) return parsed.error;

  const result = await login({
    ...parsed.data,
    userAgent: req.headers.get("user-agent"),
  });
  if (!result.ok) {
    const status = result.code === "email_not_verified" ? 403 : 401;
    return jsonError(result.code, result.message, status);
  }

  await setSessionCookie(result.data.session.token, result.data.session.expiresAt);
  return NextResponse.json({ user: result.data.user });
}
