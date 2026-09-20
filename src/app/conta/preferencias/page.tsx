"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { DayNightWindowToggle } from "@/components/effects/day-night-toggle/DayNightWindowToggle";
import { REGIONS } from "@/lib/data/regions";
import { cn } from "@/lib/cn";
import type { PublicUser } from "@/lib/auth/session";

type Channels = { push: boolean; email: boolean; sms: boolean };

export default function PreferenciasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState<Channels>({ push: true, email: true, sms: false });
  const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [favorite, setFavorite] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/preferences", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { user: PublicUser }) => {
        setChannels(body.user.notificationChannels);
        setTempUnit(body.user.preferences.temperatureUnit);
        setFavorite(body.user.favoriteRegionSlug);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    await fetch("/api/account/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
    setSaving(false);
  }

  function setChannel(key: keyof Channels, value: boolean) {
    setChannels((c) => ({ ...c, [key]: value }));
    save({ [`notify${key[0].toUpperCase()}${key.slice(1)}`]: value });
  }

  return (
    <AccountShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-heading text-[color:var(--color-text)]">Preferências</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Alterações aqui são salvas na sua conta.
            </p>
          </div>
          {saving && <span className="text-xs text-[color:var(--color-text-subtle)]">Salvando...</span>}
        </div>

        <div className="flex justify-center py-2">
          <DayNightWindowToggle />
        </div>

        <Card className="flex flex-col gap-1 p-5">
          <h2 className="mb-2 text-sm font-semibold text-[color:var(--color-text)]">Unidades</h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[color:var(--color-text-muted)]">Temperatura</span>
            <div className="inline-flex rounded-[var(--radius-full)] border border-[color:var(--color-border)] p-0.5">
              {(["celsius", "fahrenheit"] as const).map((unit) => (
                <button
                  key={unit}
                  disabled={loading}
                  onClick={() => {
                    setTempUnit(unit);
                    save({ temperatureUnit: unit, windUnit: "kmh" });
                  }}
                  aria-pressed={tempUnit === unit}
                  className={cn(
                    "rounded-[var(--radius-full)] px-3 py-1 text-xs font-medium transition-[background-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-95",
                    tempUnit === unit
                      ? "bg-[color:var(--color-interactive)] text-[color:var(--color-on-accent)]"
                      : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                  )}
                >
                  {unit === "celsius" ? "°C" : "°F"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <h2 className="mb-2 text-sm font-semibold text-[color:var(--color-text)]">Região favorita</h2>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.slug}
                disabled={loading}
                onClick={() => {
                  setFavorite(r.slug);
                  save({ favoriteRegionSlug: r.slug });
                }}
                aria-pressed={favorite === r.slug}
                className={cn(
                  "rounded-[var(--radius-full)] border px-3 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-95",
                  favorite === r.slug
                    ? "border-[color:var(--color-interactive)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]"
                )}
              >
                {r.shortName}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col divide-y divide-[color:var(--color-border)] p-5">
          <h2 className="mb-1 text-sm font-semibold text-[color:var(--color-text)]">Canais de notificação</h2>
          <Switch
            label="Notificações push"
            description="Avisos imediatos no navegador ou app"
            checked={channels.push}
            onChange={(v) => setChannel("push", v)}
          />
          <Switch
            label="E-mail"
            description="Resumos e alertas por e-mail"
            checked={channels.email}
            onChange={(v) => setChannel("email", v)}
          />
          <Switch
            label="SMS"
            description="Apenas para alertas oficiais de severidade alta"
            checked={channels.sms}
            onChange={(v) => setChannel("sms", v)}
          />
        </Card>
      </div>
    </AccountShell>
  );
}
