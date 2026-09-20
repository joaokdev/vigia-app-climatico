import { NextResponse } from "next/server";
import { requireUser } from "@/server/lib/require-user";
import { jsonError, parseBody } from "@/server/lib/http";
import { updateProfileSchema } from "@/server/account/schema";
import { updateProfile } from "@/server/account/repository";

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);

  const parsed = await parseBody(req, updateProfileSchema);
  if (parsed.error) return parsed.error;

  const updated = await updateProfile(user.id, parsed.data.name);
  return NextResponse.json({ name: updated.name });
}
