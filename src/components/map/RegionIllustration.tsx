import type { RegionSlug } from "@/lib/data/regions";

/**
 * Ilustração cartográfica esquemática por região — NÃO é um mapa
 * de tiles real. Serve para a FASE 1 comunicar contexto geográfico
 * único de cada região (não são quatro mapas idênticos
 * redimensionados). Na FASE 2, esta camada é substituída pelo
 * MapLibre GL JS com fontes de tile reais.
 */
export function RegionIllustration({ slug }: { slug: RegionSlug }) {
  const common = {
    viewBox: "0 0 320 200",
    className: "h-full w-full",
    role: "img" as const,
  };

  switch (slug) {
    case "uniao-da-vitoria":
      return (
        <svg {...common} aria-label="Esquema geográfico de União da Vitória / Porto União, dividida pelo Rio Iguaçu">
          <rect width="320" height="200" fill="var(--color-map-base)" />
          <path d="M0 60 Q 90 40 140 90 T 320 70" stroke="var(--data-rain-3)" strokeWidth="7" fill="none" opacity="0.55" />
          <path d="M0 70 Q 90 50 140 100 T 320 80" stroke="var(--data-rain-2)" strokeWidth="14" fill="none" opacity="0.5" />
          <g opacity="0.5">
            <circle cx="95" cy="140" r="34" fill="var(--color-map-grid)" />
            <circle cx="230" cy="45" r="30" fill="var(--color-map-grid)" />
          </g>
          <path d="M150 60 L150 200" stroke="var(--color-border-strong)" strokeDasharray="2 4" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "cruz-machado":
      return (
        <svg {...common} aria-label="Esquema geográfico de Cruz Machado / Santana, relevo ondulado com cobertura florestal">
          <rect width="320" height="200" fill="var(--color-map-base)" />
          <path d="M-10 130 Q 60 90 130 130 T 330 120" fill="var(--color-map-grid)" />
          <path d="M-10 160 Q 80 120 160 160 T 330 150" fill="var(--color-map-grid)" opacity="0.7" />
          <g opacity="0.55" fill="var(--data-temp-mild)">
            {[40, 80, 120, 170, 210, 250].map((x, i) => (
              <circle key={x} cx={x} cy={60 + (i % 2) * 18} r="10" />
            ))}
          </g>
        </svg>
      );
    case "bituruna":
      return (
        <svg {...common} aria-label="Esquema geográfico de Bituruna, planalto de altitude elevada">
          <rect width="320" height="200" fill="var(--color-map-base)" />
          {[70, 55, 40, 25].map((r, i) => (
            <ellipse
              key={r}
              cx="160"
              cy="120"
              rx={140 - i * 22}
              ry={r}
              fill="none"
              stroke="var(--color-border-strong)"
              strokeWidth="1.2"
              opacity={0.4 + i * 0.1}
            />
          ))}
          <path d="M120 60 L160 30 L200 60" stroke="var(--data-temp-cold)" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      );
    case "inacio-martins":
      return (
        <svg {...common} aria-label="Esquema geográfico de Inácio Martins, vale de transição entre planalto e bacia">
          <rect width="320" height="200" fill="var(--color-map-base)" />
          <path
            d="M0 150 Q 60 110 100 150 T 200 140 T 320 160"
            stroke="var(--data-rain-2)"
            strokeWidth="6"
            fill="none"
            opacity="0.6"
          />
          <g opacity="0.5" fill="var(--data-temp-warm)">
            <circle cx="250" cy="60" r="24" />
          </g>
          <path d="M0 90 L320 90" stroke="var(--color-border)" strokeWidth="1" opacity="0.3" />
        </svg>
      );
  }
}
