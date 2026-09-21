import type { Metadata } from "next";
import Link from "next/link";
import { REGIONS, type RegionSlug } from "@/lib/data/regions";
import { getRegionSnapshot } from "@/lib/providers";
import { Card } from "@/components/ui/Card";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { WeatherMetric } from "@/components/ui/WeatherMetric";
import { IconMoon, IconTemperature, IconWind, IconRain } from "@/components/icons";
import { conditionLabel } from "@/lib/weather-labels";
import { cn } from "@/lib/cn";
import { getMoonPhase, MOON_PHASE_LABEL } from "@/lib/moon-phase";
import { evaluateForagingCondition, FORAGING_LABEL, REGIONAL_PLANTING_CALENDAR } from "@/lib/agro";

export const metadata: Metadata = {
  title: "VIGIA Agro",
  description:
    "Fase da lua, condições para apicultura e calendário regional de plantio para a região das quatro cidades monitoradas pelo VIGIA.",
};

export const dynamic = "force-dynamic";

function isRegionSlug(value: string | undefined): value is RegionSlug {
  return REGIONS.some((r) => r.slug === value);
}

export default async function AgroPage({
  searchParams,
}: {
  searchParams: Promise<{ regiao?: string }>;
}) {
  const params = await searchParams;
  const slug = isRegionSlug(params.regiao) ? params.regiao : REGIONS[0].slug;
  const region = REGIONS.find((r) => r.slug === slug) ?? REGIONS[0];
  const snapshot = await getRegionSnapshot(region.slug);

  const moon = getMoonPhase();
  const foraging = evaluateForagingCondition(snapshot.weather);

  return (
    <div className="vigia-container flex max-w-3xl flex-col gap-8 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-display text-[color:var(--color-text)]">VIGIA Agro</h1>
        <p className="text-[color:var(--color-text-muted)]">
          Camada agrícola e apícola do VIGIA para quem trabalha a terra na região.
          Combina dados meteorológicos reais já usados no restante do app com
          referências agronômicas gerais — nunca substitui a orientação de um
          agrônomo ou técnico local.
        </p>
      </header>

      <nav aria-label="Selecionar região" className="flex flex-wrap items-center gap-2">
        {REGIONS.map((r) => {
          const isActive = r.slug === region.slug;
          return (
            <Link
              key={r.slug}
              href={`/agro?regiao=${r.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-[color:var(--color-interactive)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text)]"
              )}
            >
              {r.shortName}
            </Link>
          );
        })}
        <Link
          href={`/cidade/${region.slug}/agro`}
          className="ml-auto text-sm font-medium text-[color:var(--color-interactive)] underline underline-offset-2"
        >
          Ver &quot;O que plantar agora&quot; em {region.shortName} →
        </Link>
      </nav>

      {/* Fase lunar */}
      <Card elevated className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <IconMoon size={20} className="text-[color:var(--color-accent)]" />
          <h2 className="text-heading text-[color:var(--color-text)]">Fase da lua hoje</h2>
        </div>
        <p className="font-data text-lg text-[color:var(--color-text)]">
          {MOON_PHASE_LABEL[moon.phase]}
        </p>
        <p className="text-xs text-[color:var(--color-text-subtle)]">
          Calculada por posição astronômica (ciclo sinódico), sem depender de
          serviço externo — aproximação de referência, não efeméride de precisão.
        </p>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Muitos produtores da região seguem tradicionalmente o calendário lunar
          para decidir época de plantio e colheita. A evidência científica sobre
          esse efeito é limitada e debatida — o VIGIA mostra a fase como
          referência para quem já usa esse costume, não como recomendação técnica.
        </p>
      </Card>

      {/* Apicultura */}
      <Card elevated className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-heading text-[color:var(--color-text)]">
            Condições para apicultura em {region.shortName}
          </h2>
          <NatureBadge nature={snapshot.weather.provenance.nature} />
        </div>
        <p
          className={cn(
            "w-fit rounded-[var(--radius-sm)] px-2.5 py-1 text-sm font-medium",
            foraging.condition === "favoravel" && "bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]",
            foraging.condition === "parcial" && "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]",
            foraging.condition === "desfavoravel" && "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]",
            foraging.condition === "indefinido" && "bg-[color:var(--color-surface-sunken)] text-[color:var(--color-text-subtle)]"
          )}
        >
          {FORAGING_LABEL[foraging.condition]}
        </p>
        <ul className="flex flex-col gap-1 text-sm text-[color:var(--color-text-muted)]">
          {foraging.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-3 border-t border-[color:var(--color-border)] pt-4">
          <WeatherMetric icon={<IconTemperature size={16} />} label="Temperatura" value={snapshot.weather.temperatureC} unit="°C" />
          <WeatherMetric icon={<IconWind size={16} />} label="Vento" value={snapshot.weather.windSpeedKmh} unit="km/h" />
          <WeatherMetric icon={<IconRain size={16} />} label="Condição" value={conditionLabel(snapshot.weather.condition)} />
        </div>
        <p className="text-[11px] text-[color:var(--color-text-subtle)]">
          Heurística baseada em faixas usuais de forrageamento de abelhas
          (temperatura, vento e chuva) — não é uma métrica apícola oficial.
        </p>
      </Card>

      {/* Calendário de plantio */}
      <Card elevated className="flex flex-col gap-3 p-5">
        <h2 className="text-heading text-[color:var(--color-text)]">
          Calendário regional de plantio (referência geral)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-[color:var(--color-text-subtle)]">
                <th className="py-2 pr-3 font-medium">Cultura</th>
                <th className="py-2 pr-3 font-medium">Janela usual</th>
                <th className="py-2 font-medium">Observação</th>
              </tr>
            </thead>
            <tbody>
              {REGIONAL_PLANTING_CALENDAR.map((row) => (
                <tr key={row.crop} className="border-b border-[color:var(--color-border)] last:border-0">
                  <td className="py-2 pr-3 text-[color:var(--color-text)]">{row.crop}</td>
                  <td className="py-2 pr-3 text-[color:var(--color-text-muted)]">{row.window}</td>
                  <td className="py-2 text-[color:var(--color-text-subtle)]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[color:var(--color-text-subtle)]">
          Referência agronômica geral para o Centro-Sul do Paraná — não é uma
          recomendação individualizada. Janelas reais variam por solo, altitude
          e ano-safra; consulte um agrônomo ou a Emater local antes de decidir.
        </p>
      </Card>
    </div>
  );
}
