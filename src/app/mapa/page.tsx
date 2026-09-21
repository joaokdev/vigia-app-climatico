import type { Metadata } from "next";
import { REGIONS } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { MapExplorer } from "@/components/map/MapExplorer";

export const metadata: Metadata = {
  title: "Mapa regional",
  description: "Mapa real e interativo das quatro regiões monitoradas pelo VIGIA, com radar de chuva.",
};

// Clima ao vivo (Redis já cuida do cache de verdade) — sem SSG aqui.
export const dynamic = "force-dynamic";

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
          Mapa geográfico real (MapLibre GL JS, basemap OpenFreeMap) das
          quatro regiões monitoradas pelo VIGIA, com camada real de radar
          de chuva (RainViewer). Nuvens e vento ainda não têm um provedor
          de tiles gratuito equivalente — ver <a href="/fontes" className="underline underline-offset-2">/fontes</a>.
        </p>
      </header>

      <MapExplorer items={items} />
    </div>
  );
}
