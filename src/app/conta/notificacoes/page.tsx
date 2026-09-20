"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { IconNotification } from "@/components/icons";
import { cn } from "@/lib/cn";

type Notification = { id: string; title: string; body: string; read: boolean; createdAt: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificacoesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = items.filter((i) => !i.read).length;

  useEffect(() => {
    fetch("/api/account/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { notifications: Notification[] }) => setItems(body.notifications))
      .finally(() => setLoading(false));
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    fetch("/api/account/notifications", { method: "PATCH" }).catch(() => {});
  }

  function markOneRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    fetch(`/api/account/notifications/${id}`, { method: "PATCH" }).catch(() => {});
  }

  return (
    <AccountShell>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-[color:var(--color-text)]">Notificações</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              {unreadCount > 0 ? `${unreadCount} não lida(s)` : "Tudo em dia"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {loading ? null : items.length === 0 ? (
          <EmptyState
            title="Nenhuma notificação"
            description="Você será avisado aqui quando houver alertas ou atualizações relevantes."
          />
        ) : (
          <Card className="flex flex-col divide-y divide-[color:var(--color-border)]">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => markOneRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-[color:var(--color-surface-sunken)] active:bg-[color:var(--color-surface-sunken)]",
                  !n.read && "bg-[color:var(--color-accent-soft)]/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    n.read
                      ? "bg-[color:var(--color-surface-sunken)] text-[color:var(--color-text-subtle)]"
                      : "bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                  )}
                >
                  <IconNotification size={15} />
                </span>
                <div className="flex-1">
                  <p className={cn("text-sm", n.read ? "text-[color:var(--color-text-muted)]" : "font-medium text-[color:var(--color-text)]")}>
                    {n.title}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-subtle)]">{n.body}</p>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-subtle)]">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-interactive)]" aria-hidden />
                )}
              </button>
            ))}
          </Card>
        )}
      </div>
    </AccountShell>
  );
}
