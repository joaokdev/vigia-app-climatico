import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { resetPasswordSchema } from "@/server/auth/schema";
import { resetPassword } from "@/server/auth/service";

export async function POST(req: Request) {
  const parsed = await parseBody(req, resetPasswordSchema);
  if (parsed.error) return parsed.error;

  const result = await resetPassword(parsed.data);
  if (!result.ok) return jsonError(result.code, result.message, 400);

  return NextResponse.json({ reset: true });
}
