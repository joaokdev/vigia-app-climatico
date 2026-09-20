import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function jsonError(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

/**
 * Faz parse + validação do corpo JSON com o schema dado. Retorna os
 * dados validados ou já devolve a Response de erro 400 pronta — quem
 * chama só precisa checar qual dos dois veio.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<{ data: T; error?: undefined } | { data?: undefined; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: jsonError("invalid_json", "Corpo da requisição inválido.", 400) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: jsonError("validation_error", "Dados inválidos.", 400, {
        fields: result.error.flatten().fieldErrors,
      }),
    };
  }
  return { data: result.data };
}
