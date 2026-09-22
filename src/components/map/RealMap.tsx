"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MAP_STYLE_URL,
  RAIN_LAYER_METADATA_URL,
  RAIN_TILE_SIZE,
  RAIN_TILE_COLOR_AND_OPTIONS,
} from "@/lib/map-config";

export type MapMarker = {
  slug: string;
  lat: number;
  lng: number;
  label: string;
  /** Aparece no popup — mantém o mapa como produto de dado, não decoração. */
  summary?: string;
  href?: string;
};

type RainMeta = { host: string; path: string } | null;

async function fetchLatestRainFrame(): Promise<RainMeta> {
  try {
    const res = await fetch(RAIN_LAYER_METADATA_URL, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      host: string;
      radar: { past: { time: number; path: string }[] };
    };
    const last = data.radar.past.at(-1);
    if (!last) return null;
    return { host: data.host, path: last.path };
  } catch {
    return null;
  }
}

const RAIN_SOURCE_ID = "vigia-rain-radar";
const RAIN_LAYER_ID = "vigia-rain-radar-layer";

/**
 * Mapa geográfico real (não decorativo). Basemap vetorial OpenFreeMap
 * "liberty" via MapLibre GL JS; camada de chuva usa tiles reais de
 * radar da RainViewer quando `showRain` está ativo. Sem chave em
 * nenhum dos dois — ver `lib/map-config.ts` para as fontes.
 *
 * Marcadores usam sempre coordenadas reais de `lib/data/regions.ts` —
 * nunca posição aproximada/aleatória.
 */
export function RealMap({
  markers,
  focusSlug,
  showRain = false,
  interactive = true,
  className,
}: {
  markers: MapMarker[];
  focusSlug?: string;
  showRain?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const rainLoadedRef = useRef(false);
  // Ref (não estado) porque `markers` chega como um array novo a cada
  // render do componente pai — colocá-lo nas deps do efeito de foco
  // abaixo faria o mapa "voar" de novo a cada re-render não relacionado
  // (ex.: alternar a camada de chuva). O efeito de foco só precisa do
  // valor mais recente no momento em que `focusSlug` muda.
  const markersRef = useRef(markers);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const focus = markers.find((m) => m.slug === focusSlug) ?? markers[0];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: focus ? [focus.lng, focus.lat] : [-51.09, -26.05],
      zoom: focusSlug ? 10.5 : 8.4,
      attributionControl: { compact: true },
      interactive,
    });
    mapRef.current = map;

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    }

    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.setAttribute("aria-label", marker.label);
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.25)";
      el.style.background = marker.slug === focusSlug ? "#e0673c" : "#3b6fb0";
      el.style.cursor = marker.href ? "pointer" : "default";

      const popupHtml = `<strong>${marker.label}</strong>${
        marker.summary ? `<br/><span style="font-size:11px">${marker.summary}</span>` : ""
      }`;

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(popupHtml);
      new maplibregl.Marker({ element: el }).setLngLat([marker.lng, marker.lat]).setPopup(popup).addTo(map);

      if (marker.href) {
        el.addEventListener("click", () => {
          window.location.href = marker.href as string;
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      rainLoadedRef.current = false;
    };
    // Mapa é inicializado uma única vez por montagem — markers/focusSlug
    // não devem recriar a instância (custoso); mudanças de foco são
    // tratadas separadamente, se necessário no futuro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    async function syncRainLayer(map: maplibregl.Map) {
      if (!showRain) {
        if (map.getLayer(RAIN_LAYER_ID)) {
          map.setLayoutProperty(RAIN_LAYER_ID, "visibility", "none");
        }
        return;
      }

      if (rainLoadedRef.current) {
        if (map.getLayer(RAIN_LAYER_ID)) {
          map.setLayoutProperty(RAIN_LAYER_ID, "visibility", "visible");
        }
        return;
      }

      const frame = await fetchLatestRainFrame();
      if (!frame || !mapRef.current) return; // fonte indisponível — nenhuma camada falsa no lugar

      const tileUrl = `${frame.host}${frame.path}/${RAIN_TILE_SIZE}/{z}/{x}/{y}/${RAIN_TILE_COLOR_AND_OPTIONS}.png`;
      map.addSource(RAIN_SOURCE_ID, {
        type: "raster",
        tiles: [tileUrl],
        tileSize: RAIN_TILE_SIZE,
        attribution: "Radar: RainViewer",
      });
      map.addLayer({
        id: RAIN_LAYER_ID,
        type: "raster",
        source: RAIN_SOURCE_ID,
        paint: { "raster-opacity": 0.55 },
      });
      rainLoadedRef.current = true;
    }

    if (map.isStyleLoaded()) {
      syncRainLayer(map);
    } else {
      map.once("load", () => syncRainLayer(map));
    }
  }, [showRain]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusSlug) return;

    function fly(map: maplibregl.Map) {
      const focus = markersRef.current.find((m) => m.slug === focusSlug);
      if (!focus) return;
      map.flyTo({ center: [focus.lng, focus.lat], zoom: 10.5, duration: 900 });
    }

    // Troca de foco anima a câmera para a nova região em vez de recriar
    // o mapa (o componente que usa RealMap não precisa mais forçar
    // remount com `key` a cada seleção — isso descartava e recarregava
    // o WebGL/tiles inteiros a cada clique).
    if (map.isStyleLoaded()) {
      fly(map);
    } else {
      map.once("load", () => fly(map));
    }
    // markersRef é intencionalmente lido via ref (ver comentário acima) —
    // só a mudança de foco deve reacionar este efeito.
  }, [focusSlug]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
