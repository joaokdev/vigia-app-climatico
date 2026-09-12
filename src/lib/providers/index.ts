import type { RegionSlug } from "../data/regions";
import type { RegionSnapshot } from "./types";
import { getMockRegionSnapshot } from "./mock";

/**
 * Ponto único de acesso a dados de região para toda a UI.
 *
 * FASE 1: delega para os mock providers.
 * FASE 2: passa a chamar a camada real (adapters + cache Redis +
 * banco), preservando a mesma assinatura — nenhum componente
 * precisa mudar.
 */
export async function getRegionSnapshot(
  slug: RegionSlug
): Promise<RegionSnapshot> {
  // FASE 1 — dado de demonstração, estrutura idêntica ao contrato real.
  return getMockRegionSnapshot(slug);
}

export * from "./types";
