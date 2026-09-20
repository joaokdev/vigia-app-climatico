import type { RegionSlug } from "../data/regions";
import type { RegionSnapshot } from "./types";
import { getRegionSnapshot as getRealRegionSnapshot } from "@/server/regions/service";

/**
 * Ponto único de acesso a dados de região para toda a UI.
 *
 * FASE 2: delega para a camada real (Open-Meteo + cache Redis +
 * histórico em Postgres) — ver src/server/regions/service.ts. A
 * assinatura não mudou desde a FASE 1, então nenhum componente de UI
 * precisou ser alterado para essa troca.
 */
export async function getRegionSnapshot(
  slug: RegionSlug
): Promise<RegionSnapshot> {
  return getRealRegionSnapshot(slug);
}

export * from "./types";
