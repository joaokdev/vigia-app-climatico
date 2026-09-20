import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, notifications } from "../db/schema";

export async function updateProfile(userId: string, name: string) {
  const [row] = await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return row;
}

export type PreferencesInput = Partial<{
  favoriteRegionSlug: string | null;
  temperatureUnit: "celsius" | "fahrenheit";
  windUnit: "kmh" | "ms";
  notifyPush: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
}>;

export async function updatePreferences(userId: string, input: PreferencesInput) {
  const [row] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return row;
}

export async function listNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const [row] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();
  return row ?? null;
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}
