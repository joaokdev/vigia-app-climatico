import { NextResponse } from "next/server";
import { parseBody, jsonError } from "@/server/lib/http";
import { resendOtpSchema } from "@/server/auth/schema";
import { resendOtp } from "@/server/auth/service";

export async function POST(req: Request) {
  const parsed = await parseBody(req, resendOtpSchema);
  if (parsed.error) return parsed.error;

  const result = await resendOtp(parsed.data);
  if (!result.ok) {
    return jsonError(result.code, result.message, 429, {
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }

  return NextResponse.json({ sent: true, devCode: result.data.devCode });
}
