import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { verifyOtpSchema } from "@/server/auth/schema";
import { verifyOtp } from "@/server/auth/service";
import { setSessionCookie } from "@/server/auth/session-cookie";

export async function POST(req: Request) {
  const parsed = await parseBody(req, verifyOtpSchema);
  if (parsed.error) return parsed.error;

  const result = await verifyOtp({
    ...parsed.data,
    userAgent: req.headers.get("user-agent"),
  });
  if (!result.ok) {
    const status = result.code === "too_many_attempts" ? 429 : 400;
    return jsonError(result.code, result.message, status);
  }

  if (result.data.kind === "session") {
    await setSessionCookie(result.data.session.token, result.data.session.expiresAt);
    return NextResponse.json({ kind: "session", user: result.data.user });
  }

  return NextResponse.json({ kind: "reset_token", resetToken: result.data.resetToken });
}
