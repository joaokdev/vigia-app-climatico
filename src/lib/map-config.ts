/**
 * Endpoints públicos (não-secretos) usados pelo mapa real. Estes NÃO
 * passam pelo validador de ambiente server-only (`server/lib/env.ts`)
 * de propósito: são URLs de serviço público, sem chave, consumidas
 * diretamente pelo navegador do usuário (RealMap.tsx é client
 * component) — não faz sentido threadar isso como prop por toda a
 * árvore de componentes só para reexpor o mesmo valor default do
 * `.env.example`. Se um provedor pago/com chave for adotado no
 * futuro, troque aqui.
 */

/** Estilo vetorial MapLibre — OpenFreeMap "liberty", público, sem chave. */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Metadados do radar de chuva RainViewer — público, sem chave, uso
 * pessoal/educacional/comunidade pequena (ver rainviewer.com/api.html). */
export const RAIN_LAYER_METADATA_URL = "https://api.rainviewer.com/public/weather-maps.json";

/** Tamanho de tile e opções de cor documentados pela RainViewer:
 * 256px, esquema de cor 2 ("Universal Blue"), suavizado + sem neve
 * separada (1_1). */
export const RAIN_TILE_SIZE = 256;
export const RAIN_TILE_COLOR_AND_OPTIONS = "2/1_1";
