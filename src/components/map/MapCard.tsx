"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RealMap } from "@/components/map/RealMap";
import { Skeleton } from "@/components/ui/States";
import { IconCloud, IconRain, IconWind } from "@/components/icons";
import { getRegionBySlug, type RegionSlug } from "@/lib/data/regions";
import type { ProviderStatus } from "@/lib/providers/types";
import { cn } from "@/lib/cn";

type LayerKey = "nuvens" | "chuva" | "vento";

// "chuva" tem fonte real sem chave (RainViewer). "nuvens"/"vento" ainda
// não têm um provedor de tiles real e gratuito equivalente — em vez de
// simular com uma camada decorativa, o botão fica desabilitado e
// rotulado, preservando a arquitetura de alternância de camadas para
// quando um provedor com credencial for adotado.
const LAYER_META: Record<LayerKey, { label: string; icon: typeof IconCloud; available: boolean }> = {
  chuva: { label: "Chuva (radar)", icon: IconRain, available: true },
  nuvens: { label: "Nuvens — indisponível (requer provedor com chave)", icon: IconCloud, available: false },
  vento: { label: "Vento — indisponível (requer provedor com chave)", icon: IconWind, available: false },
};

/**
 * MapCard — arquitetura de ciclo de vida preparada para mapas reais:
 *  1. placeholder estático até entrar perto da viewport
 *  2. IntersectionObserver decide quando "inicializar"
 *  3. camadas ativadas sob demanda (aqui, apenas alternam opacidade
 *     de uma ilustração; na FASE 2 alternam fontes/layers reais)
 *  4. pausa quando sai da viewport (não anima quando invisível)
 *  5. expansão leva para a página completa da cidade
 *
 * `providerStatus` decide se mostramos o estado ok/stale/offline.
 */
export function MapCard({
  slug,
  regionLabel,
  providerStatus,
}: {
  slug: RegionSlug;
  regionLabel: string;
  providerStatus: ProviderStatus;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set());

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "160px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || initialized) return;
    const timeout = setTimeout(() => setInitialized(true), 380);
    return () => clearTimeout(timeout);
  }, [inView, initialized]);

  function toggleLayer(layer: LayerKey) {
    if (!LAYER_META[layer].available) return;
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }

  const isOffline = providerStatus === "indisponivel";
  const region = getRegionBySlug(slug);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-map-base)]"
    >
      {!initialized && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {initialized && !isOffline && (
        <>
          <div className={cn("h-full w-full", inView ? "" : "[&_*]:!animation-none")}>
            {region ? (
              <RealMap
                markers={[{ slug: region.slug, lat: region.center.lat, lng: region.center.lng, label: region.shortName }]}
                focusSlug={region.slug}
                showRain={activeLayers.has("chuva")}
                interactive={false}
              />
            ) : null}
          </div>

          {/* Controles de camada */}
          <div className="absolute left-2 top-2 z-[var(--z-map-controls)] flex gap-1">
            {(Object.keys(LAYER_META) as LayerKey[]).map((key) => {
              const { label, icon: Icon, available } = LAYER_META[key];
              const active = activeLayers.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLayer(key)}
                  disabled={!available}
                  aria-pressed={active}
                  aria-disabled={!available}
                  aria-label={`Camada ${label}`}
                  title={label}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border text-[11px] backdrop-blur-sm",
                    "transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-90",
                    !available && "cursor-not-allowed opacity-40",
                    active
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 text-[color:var(--color-text-muted)]"
                  )}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          {providerStatus === "stale" && (
            <span className="absolute right-2 top-2 rounded-[var(--radius-sm)] bg-[color:var(--color-surface)]/90 px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-warning)]">
              Dado desatualizado
            </span>
          )}
        </>
      )}

      {initialized && isOffline && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[color:var(--color-surface-sunken)] px-4 text-center">
          <p className="text-xs font-medium text-[color:var(--color-text-muted)]">
            Mapa interativo indisponível no momento
          </p>
          <p className="text-[11px] text-[color:var(--color-text-subtle)]">
            Mostrando última posição conhecida da região
          </p>
        </div>
      )}

      <Link
        href={`/cidade/${slug}`}
        className="absolute bottom-2 right-2 z-[var(--z-map-controls)] rounded-[var(--radius-sm)] bg-[color:var(--color-surface)]/90 px-2.5 py-1 text-xs font-medium text-[color:var(--color-text)] shadow-[var(--shadow-elevation-1)] hover:bg-[color:var(--color-surface)]"
      >
        Expandir mapa de {regionLabel} →
      </Link>
    </div>
  );
}
