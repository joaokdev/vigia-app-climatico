import { NextResponse } from "next/server";
import { requireUser } from "@/server/lib/require-user";
import { jsonError, parseBody } from "@/server/lib/http";
import { updatePreferencesSchema } from "@/server/account/schema";
import { updatePreferences } from "@/server/account/repository";

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return jsonError("unauthenticated", "Não autenticado.", 401);

  const parsed = await parseBody(req, updatePreferencesSchema);
  if (parsed.error) return parsed.error;

  const updated = await updatePreferences(user.id, parsed.data);
  return NextResponse.json({
    favoriteRegionSlug: updated.favoriteRegionSlug,
    preferences: {
      temperatureUnit: updated.temperatureUnit,
      windUnit: updated.windUnit,
    },
    notificationChannels: {
      push: updated.notifyPush,
      email: updated.notifyEmail,
      sms: updated.notifySms,
    },
  });
}
