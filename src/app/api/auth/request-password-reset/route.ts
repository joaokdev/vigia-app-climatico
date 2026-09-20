import { NextResponse } from "next/server";
import { parseBody } from "@/server/lib/http";
import { requestPasswordResetSchema } from "@/server/auth/schema";
import { requestPasswordReset } from "@/server/auth/service";

export async function POST(req: Request) {
  const parsed = await parseBody(req, requestPasswordResetSchema);
  if (parsed.error) return parsed.error;

  // Sempre 200 — a neutralidade é intencional (não revela se o e-mail
  // existe), já documentado na tela /recuperar-acesso.
  const result = await requestPasswordReset(parsed.data);
  return NextResponse.json({
    requested: true,
    // Só presente quando VIGIA_DEV_EXPOSE_OTP=true — nunca em produção.
    devCode: result.ok ? result.data.devCode : undefined,
  });
}
