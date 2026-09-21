import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRegionBySlug, type RegionSlug } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { getPlantingOpportunities } from "@/server/agro/plantio";
import { PlantingOpportunityCard } from "@/components/agro/PlantingOpportunityCard";
import { MoonCard } from "@/components/agro/MoonCard";
import { BeekeepingCard } from "@/components/agro/BeekeepingCard";
import { AgroCalendar } from "@/components/agro/AgroCalendar";
import { IconChevronRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const region = getRegionBySlug(slug);
    return {
      title: region ? `Área do Agricultor · ${region.shortName}` : "Área do Agricultor",
      description: "Condições de plantio, calendário agrícola, apicultura e lua e tradição para a região.",
    };
  });
}

export default async function AgroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  // Reaproveita a MESMA camada de snapshot da página principal da
  // cidade — nenhuma chamada de rede duplicada (ATUALIZACAO_DO_VIGIA.md §16).
  const snapshot = await getRegionSnapshot(region.slug as RegionSlug);
  const opportunities = getPlantingOpportunities(snapshot);

  return (
    <div className="vigia-container flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <Link
          href={`/cidade/${region.slug}`}
          className="flex items-center gap-1 text-xs text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text)]"
        >
          ← Voltar para {region.shortName}
        </Link>
        <h1 className="text-display text-[color:var(--color-text)]">Área do Agricultor</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-muted)]">
          Leitura rápida do que está favorável hoje em {region.shortName}, calendário agrícola,
          apicultura e o contexto lunar tradicional — construído sobre os mesmos dados
          meteorológicos já medidos e previstos pelo VIGIA nesta região.
        </p>
      </header>

      <section aria-labelledby="plantar-heading" className="flex flex-col gap-3">
        <h2 id="plantar-heading" className="text-heading text-[color:var(--color-text)]">
          O que plantar agora
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((op) => (
            <PlantingOpportunityCard key={op.crop.key} opportunity={op} />
          ))}
        </div>
      </section>

      <section aria-labelledby="apicultura-heading" className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 id="apicultura-heading" className="text-heading text-[color:var(--color-text)]">
            Apicultura
          </h2>
          <BeekeepingCard snapshot={snapshot} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-heading text-[color:var(--color-text)]">Lua e tradição</h2>
          <MoonCard />
        </div>
      </section>

      <section aria-labelledby="calendario-heading" className="flex flex-col gap-3">
        <h2 id="calendario-heading" className="text-heading text-[color:var(--color-text)]">
          Calendário agrícola
        </h2>
        <AgroCalendar />
      </section>

      <p className="flex items-center gap-1 text-[11px] text-[color:var(--color-text-subtle)]">
        <IconChevronRight size={12} />
        Orientação geral, não uma garantia agronômica. Para uma decisão de plantio, consulte o
        IDR-Paraná (ex-IAPAR/EMATER-PR).
      </p>
    </div>
  );
}
