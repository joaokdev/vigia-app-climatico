import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
});

export const updatePreferencesSchema = z
  .object({
    favoriteRegionSlug: z.string().nullable(),
    temperatureUnit: z.enum(["celsius", "fahrenheit"]),
    windUnit: z.enum(["kmh", "ms"]),
    notifyPush: z.boolean(),
    notifyEmail: z.boolean(),
    notifySms: z.boolean(),
  })
  .partial();
