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

  // Fluxo atual (sem verificação por código): a conta já vem com sessão
  // criada — o cliente entra direto, sem tela de OTP no meio.
  if (result.data.kind === "session") {
    await setSessionCookie(result.data.session.token, result.data.session.expiresAt);
    return NextResponse.json({ kind: "session", user: result.data.user });
  }

  // Caminho preservado para quando a verificação por código for
  // reativada (ver EMAIL_VERIFICATION_REQUIRED em server/auth/service.ts).
  return NextResponse.json({
    kind: "otp_sent",
    email: result.data.email,
    // Só presente quando VIGIA_DEV_EXPOSE_OTP=true (ver server/lib/env.ts) —
    // nunca em produção.
    devCode: result.data.devCode,
  });
}
