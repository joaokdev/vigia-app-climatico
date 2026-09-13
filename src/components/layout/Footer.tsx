import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { REGIONS } from "@/lib/data/regions";
import { SocialLinks } from "@/components/effects/social-links/SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <div className="vigia-container grid gap-8 py-10 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo size={34} />
          <p className="max-w-xs text-sm text-[color:var(--color-text-muted)]">
            Central regional de monitoramento ambiental para a região de União
            da Vitória, Cruz Machado, Bituruna e Inácio Martins.
          </p>
          <div className="mt-1 origin-left scale-[0.55]">
            <SocialLinks />
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-[color:var(--color-text)]">Regiões</h4>
          <ul className="flex flex-col gap-2 text-sm text-[color:var(--color-text-muted)]">
            {REGIONS.map((r) => (
              <li key={r.slug}>
                <Link href={`/cidade/${r.slug}`} className="hover:text-[color:var(--color-text)]">
                  {r.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-[color:var(--color-text)]">Produto</h4>
          <ul className="flex flex-col gap-2 text-sm text-[color:var(--color-text-muted)]">
            <li><Link href="/mapa" className="hover:text-[color:var(--color-text)]">Mapa regional</Link></li>
            <li><Link href="/sobre" className="hover:text-[color:var(--color-text)]">Sobre o VIGIA</Link></li>
            <li><Link href="/fontes" className="hover:text-[color:var(--color-text)]">Fontes de dados</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-[color:var(--color-text)]">Conta</h4>
          <ul className="flex flex-col gap-2 text-sm text-[color:var(--color-text-muted)]">
            <li><Link href="/login" className="hover:text-[color:var(--color-text)]">Entrar</Link></li>
            <li><Link href="/cadastro" className="hover:text-[color:var(--color-text)]">Criar conta</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-border)] py-4">
        <p className="vigia-container text-xs text-[color:var(--color-text-subtle)]">
          VIGIA — Clima sempre a frente. Dados de demonstração na FASE 1; nenhuma
          fonte externa real está integrada nesta etapa.
        </p>
      </div>
    </footer>
  );
}
