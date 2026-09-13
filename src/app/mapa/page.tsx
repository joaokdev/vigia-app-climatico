import type { Metadata } from "next";
import { REGIONS } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { MapExplorer } from "@/components/map/MapExplorer";

export const metadata: Metadata = {
  title: "Mapa regional",
  description: "Mapa demonstrativo das quatro regiões monitoradas pelo VIGIA.",
};

export default async function MapaPage() {
  const items = await Promise.all(
    REGIONS.map(async (region) => ({
      region,
      snapshot: await getRegionSnapshot(region.slug),
    }))
  );

  return (
    <div className="vigia-container flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display text-[color:var(--color-text)]">
          Mapa regional
        </h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-muted)]">
          Visualização demonstrativa das quatro regiões monitoradas pelo
          VIGIA. Na FASE 1, os mapas são ilustrações esquemáticas — a
          integração com dados geoespaciais reais (MapLibre GL JS) chega na
          FASE 2.
        </p>
      </header>

      <MapExplorer items={items} />
    </div>
  );
}
