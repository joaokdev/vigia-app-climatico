import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase } from "../__tests__/db-helpers";
import { pool } from "../db/client";
import { redis } from "../db/redis";
import { registerUser, verifyOtp } from "../auth/service";
import {
  updatePreferences,
  updateProfile,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./repository";
import { db } from "../db/client";
import { notifications } from "../db/schema";

vi.spyOn(console, "warn").mockImplementation(() => {});

beforeEach(async () => {
  await cleanDatabase();
  await redis.flushdb();
});

afterAll(async () => {
  await pool.end();
  redis.disconnect();
});

async function createVerifiedUser(email: string) {
  const reg = await registerUser({ name: "Teste", email, password: "senhaforte123" });
  if (!reg.ok) throw new Error("setup falhou");
  const verify = await verifyOtp({ email, code: reg.data.devCode!, purpose: "email_verification" });
  if (!verify.ok || verify.data.kind !== "session") throw new Error("setup falhou");
  return verify.data.user;
}

describe("updateProfile", () => {
  it("atualiza o nome do usuário", async () => {
    const user = await createVerifiedUser("perfil@vigia.dev");
    const updated = await updateProfile(user.id, "Novo Nome");
    expect(updated.name).toBe("Novo Nome");
  });
});

describe("updatePreferences", () => {
  it("atualiza parcialmente sem apagar os outros campos", async () => {
    const user = await createVerifiedUser("prefs@vigia.dev");

    await updatePreferences(user.id, { favoriteRegionSlug: "bituruna" });
    const afterFirst = await updatePreferences(user.id, { temperatureUnit: "fahrenheit" });

    // A primeira alteração (favoriteRegionSlug) não deve ter sido
    // perdida pela segunda chamada, que só mexeu em temperatureUnit.
    expect(afterFirst.favoriteRegionSlug).toBe("bituruna");
    expect(afterFirst.temperatureUnit).toBe("fahrenheit");
  });
});

describe("notifications", () => {
  it("lista, marca uma como lida e depois todas", async () => {
    const user = await createVerifiedUser("notif@vigia.dev");
    await db.insert(notifications).values([
      { userId: user.id, title: "A", body: "corpo A" },
      { userId: user.id, title: "B", body: "corpo B" },
    ]);

    const list = await listNotifications(user.id);
    expect(list).toHaveLength(2);
    expect(list.every((n) => !n.read)).toBe(true);

    await markNotificationRead(user.id, list[0].id);
    const afterOne = await listNotifications(user.id);
    expect(afterOne.filter((n) => n.read)).toHaveLength(1);

    await markAllNotificationsRead(user.id);
    const afterAll = await listNotifications(user.id);
    expect(afterAll.every((n) => n.read)).toBe(true);
  });

  it("não deixa marcar como lida uma notificação de outro usuário", async () => {
    const userA = await createVerifiedUser("dono@vigia.dev");
    const userB = await createVerifiedUser("intruso@vigia.dev");
    const [note] = await db
      .insert(notifications)
      .values({ userId: userA.id, title: "Privada", body: "..." })
      .returning();

    const result = await markNotificationRead(userB.id, note.id);
    expect(result).toBeNull();
  });
});
