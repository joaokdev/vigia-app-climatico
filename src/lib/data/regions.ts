/**
 * Metadados estruturais das quatro regiões monitoradas pelo VIGIA.
 * Isto NÃO é dado meteorológico/hidrológico — é apenas identidade
 * geográfica/administrativa, estável e não sujeita a "frescor".
 *
 * Coordenadas são aproximações do centro urbano de cada município,
 * suficientes para posicionamento de mapa demonstrativo na FASE 1.
 * Fonte: domínio público (divisão político-administrativa do IBGE).
 */

export type RegionSlug =
  | "uniao-da-vitoria"
  | "cruz-machado"
  | "bituruna"
  | "inacio-martins";

export type Region = {
  slug: RegionSlug;
  name: string;
  shortName: string;
  municipalities: string[];
  state: "PR" | "SC";
  center: { lat: number; lng: number };
  river?: {
    name: string;
    note: string;
  };
  description: string;
};

export const REGIONS: Region[] = [
  {
    slug: "uniao-da-vitoria",
    name: "União da Vitória / Porto União",
    shortName: "União da Vitória",
    municipalities: ["União da Vitória", "Porto União"],
    state: "PR",
    center: { lat: -26.2287, lng: -51.0862 },
    river: {
      name: "Rio Iguaçu",
      note:
        "Cidades geminadas separadas pelo Rio Iguaçu, historicamente sujeitas a eventos de cheia.",
    },
    description:
      "Par de cidades geminadas (PR/SC) às margens do Rio Iguaçu, região com maior sensibilidade hidrológica do conjunto monitorado.",
  },
  {
    slug: "cruz-machado",
    name: "Cruz Machado / Santana",
    shortName: "Cruz Machado",
    municipalities: ["Cruz Machado", "Santana"],
    state: "PR",
    center: { lat: -26.0644, lng: -51.3378 },
    description:
      "Região de relevo ondulado e cobertura florestal expressiva, com influência direta de frentes frias vindas do sul.",
  },
  {
    slug: "bituruna",
    name: "Bituruna",
    shortName: "Bituruna",
    municipalities: ["Bituruna"],
    state: "PR",
    center: { lat: -26.1631, lng: -51.5228 },
    description:
      "Município de altitude elevada no Segundo Planalto, com amplitude térmica mais acentuada que as demais regiões.",
  },
  {
    slug: "inacio-martins",
    name: "Inácio Martins",
    shortName: "Inácio Martins",
    municipalities: ["Inácio Martins"],
    state: "PR",
    center: { lat: -25.5972, lng: -51.0817 },
    description:
      "Região de transição entre planalto e vale, com regime de chuvas influenciado por bacias hidrográficas locais.",
  },
];

export function getRegionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}
