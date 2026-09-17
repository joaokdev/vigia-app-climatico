import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/account/SignOutButton";
import { IconAccount } from "@/components/icons";
import { mockAccount } from "@/lib/data/mock-account";
import { getRegionBySlug } from "@/lib/data/regions";

export const metadata: Metadata = { title: "Minha conta" };

export default function ContaPage() {
  const favoriteRegion = getRegionBySlug(mockAccount.favoriteRegionSlug);

  return (
    <AccountShell>
      <div className="mb-5 flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-sunken)] px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
        Modo demonstração — estes dados são fixos e não representam uma
        conta real. Login e persistência chegam na FASE 2.
      </div>

      <Card className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]">
            <IconAccount size={26} />
          </span>
          <div>
            <p className="text-base font-semibold text-[color:var(--color-text)]">{mockAccount.name}</p>
            <p className="text-sm text-[color:var(--color-text-subtle)]">{mockAccount.email}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[color:var(--color-text-subtle)]">Região favorita</dt>
            <dd className="text-sm text-[color:var(--color-text)]">{favoriteRegion?.name ?? "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[color:var(--color-text-subtle)]">Membro desde</dt>
            <dd className="text-sm text-[color:var(--color-text)]">
              {new Date(mockAccount.memberSince).toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
            </dd>
          </div>
        </dl>

        <div className="flex gap-3">
          <Button variant="secondary" size="sm">Editar perfil</Button>
          <SignOutButton />
        </div>
      </Card>
    </AccountShell>
  );
}
