import Link from "next/link";
import { REGIONS } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { RegionCard } from "@/components/region/RegionCard";
import { AlertCard } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

// Clima ao vivo (Redis já cuida do cache de verdade) — sem SSG aqui.
export const dynamic = "force-dynamic";

/**
 * Visão regional das 4 cidades monitoradas — a antiga home do VIGIA,
 * preservada aqui como painel institucional/comparativo depois que a
 * home pessoal ("Hoje") passou a ser a porta de entrada do app. Nada
 * de funcionalidade foi removido, só reorganizado.
 */
export default async function RegioesPage() {
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-xs text-[color:var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" aria-hidden />
          <span>
            Sistema VIGIA {anyStale ? "operando com uma fonte degradada" : "operando normalmente"}
          </span>
        </div>
        <span>4 regiões monitoradas</span>
      </div>

      <section className="flex flex-col gap-4">
        <h1 className="text-display max-w-3xl text-[color:var(--color-text)]">
          O que está acontecendo agora na região do Iguaçu e do Contestado.
        </h1>
        <p className="max-w-2xl text-[color:var(--color-text-muted)]">
          Clima, chuva, rios e alertas oficiais de União da Vitória / Porto
          União, Cruz Machado / Santana, Bituruna e Inácio Martins — em um
          só lugar, com a origem de cada dado sempre visível.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/mapa" className="text-sm font-medium text-[color:var(--color-interactive)] underline underline-offset-2">
            Abrir mapa regional →
          </Link>
        </div>
      </section>

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
    </div>
  );
}
