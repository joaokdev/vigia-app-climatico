import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { registerSchema } from "@/server/auth/schema";
import { registerUser } from "@/server/auth/service";
import { setSessionCookie } from "@/server/auth/session-cookie";

export async function POST(req: Request) {
  const parsed = await parseBody(req, registerSchema);
  if (parsed.error) return parsed.error;

  const result = await registerUser({
    ...parsed.data,
    userAgent: req.headers.get("user-agent"),
  });
  if (!result.ok) return jsonError(result.code, result.message, 409);

  await setSessionCookie(result.data.session.token, result.data.session.expiresAt);
  return NextResponse.json({ user: result.data.user });
}
