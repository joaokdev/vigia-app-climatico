import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/components/account/SignOutButton";
import { EditProfileForm } from "@/components/account/EditProfileForm";
import { IconAccount } from "@/components/icons";
import { requireUser } from "@/server/lib/require-user";
import { getRegionBySlug } from "@/lib/data/regions";

export const metadata: Metadata = { title: "Minha conta" };
export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const user = await requireUser();
  // O proxy só checa se o cookie existe, não se a sessão por trás dele
  // ainda é válida — este é o ponto que checa de verdade contra o banco
  // e manda para o login se a sessão expirou/foi revogada.
  if (!user) redirect("/login");

  const favoriteRegion = user.favoriteRegionSlug ? getRegionBySlug(user.favoriteRegionSlug) : undefined;

  return (
    <AccountShell>
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]">
            <IconAccount size={26} />
          </span>
          <div>
            <p className="text-base font-semibold text-[color:var(--color-text)]">{user.name}</p>
            <p className="text-sm text-[color:var(--color-text-subtle)]">{user.email}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[color:var(--color-text-subtle)]">Região favorita</dt>
            <dd className="text-sm text-[color:var(--color-text)]">{favoriteRegion?.name ?? "Nenhuma ainda"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[color:var(--color-text-subtle)]">Membro desde</dt>
            <dd className="text-sm text-[color:var(--color-text)]">
              {new Date(user.memberSince).toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
            </dd>
          </div>
        </dl>

        <div className="flex gap-3">
          <EditProfileForm currentName={user.name} />
          <SignOutButton />
        </div>
      </Card>
    </AccountShell>
  );
}
