import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { registerSchema } from "@/server/auth/schema";
import { registerUser } from "@/server/auth/service";

export async function POST(req: Request) {
  const parsed = await parseBody(req, registerSchema);
  if (parsed.error) return parsed.error;

  const result = await registerUser(parsed.data);
  if (!result.ok) return jsonError(result.code, result.message, 409);

  return NextResponse.json({
    email: result.data.email,
    // Só presente quando VIGIA_DEV_EXPOSE_OTP=true (ver server/lib/env.ts) —
    // nunca em produção.
    devCode: result.data.devCode,
  });
}
