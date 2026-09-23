import Link from "next/link";
import { REGIONS } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { RegionCard } from "@/components/region/RegionCard";
import { Button } from "@/components/ui/Button";
import { AlertCard } from "@/components/ui/Alert";
import { IconRefresh } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { FrostButton } from "@/components/effects/frost-button/FrostButton";

// Clima ao vivo (Redis já cuida do cache de verdade) — sem SSG aqui.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshots = await Promise.all(
    REGIONS.map(async (region) => ({
      region,
      snapshot: await getRegionSnapshot(region.slug),
    }))
  );

  const allAlerts = snapshots.flatMap((s) => s.snapshot.alerts);
  const anyStale = snapshots.some((s) => s.snapshot.weather.provenance.status !== "ok");

  return (
    <div className="vigia-container flex flex-col gap-12 py-8">
      {/* Estado global do sistema */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-xs text-[color:var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]"
            aria-hidden
          />
          <span>
            Sistema VIGIA {anyStale ? "operando com uma fonte degradada" : "operando normalmente"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconRefresh size={13} />
          <span>4 regiões monitoradas · dados de demonstração (FASE 1)</span>
        </div>
      </div>

      {/* Hero contextual */}
      <section className="flex flex-col gap-4">
        <h1 className="text-display max-w-3xl text-[color:var(--color-text)]">
          O que está acontecendo agora na região do Iguaçu e do Contestado.
        </h1>
        <p className="max-w-2xl text-[color:var(--color-text-muted)]">
          O VIGIA acompanha clima, chuva, rios e alertas oficiais de União da
          Vitória / Porto União, Cruz Machado / Santana, Bituruna e Inácio
          Martins — em um só lugar, com a origem de cada dado sempre visível.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <FrostButton href="/mapa">Abrir mapa regional</FrostButton>
          <Link href="/sobre">
            <Button variant="secondary" size="md">
              Como o VIGIA funciona
            </Button>
          </Link>
        </div>
      </section>

      {/* Alertas em destaque */}
      {allAlerts.length > 0 && (
        <section aria-labelledby="alertas-heading" className="flex flex-col gap-3">
          <h2 id="alertas-heading" className="text-heading text-[color:var(--color-text)]">
            Alertas oficiais ativos
          </h2>
          <Card className="p-4">
            <ul>
              {allAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* Quatro cards regionais */}
      <section aria-labelledby="regioes-heading" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 id="regioes-heading" className="text-heading text-[color:var(--color-text)]">
            Panorama regional
          </h2>
          <span className="text-xs text-[color:var(--color-text-subtle)]">
            Nível 1 — o que está acontecendo agora
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {snapshots.map(({ region, snapshot }) => (
            <RegionCard key={region.slug} region={region} snapshot={snapshot} />
          ))}
        </div>
      </section>

      {/* Explicação do VIGIA */}
      <section className="grid gap-6 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:grid-cols-3">
        <div>
          <h2 className="mb-2 text-base font-semibold text-[color:var(--color-text)]">
            O que é o VIGIA
          </h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Uma central regional de inteligência ambiental — não um clone de
            aplicativo de clima genérico. Cada dado carrega sua origem,
            horário de observação e status de atualização.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold text-[color:var(--color-text)]">
            Observado, previsto e simulado
          </h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            O VIGIA sempre distingue o que foi medido do que é modelado ou
            simulado, e nunca chama uma análise própria de &ldquo;alerta oficial&rdquo;.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold text-[color:var(--color-text)]">
            Fontes verificadas
          </h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Consulte a proveniência completa de cada fonte em{" "}
            <Link href="/fontes" className="text-[color:var(--color-interactive)] hover:underline">
              /fontes
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
