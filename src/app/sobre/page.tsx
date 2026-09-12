import type { Metadata } from "next";
import { NatureBadge } from "@/components/ui/StatusBadge";
import { REGIONS } from "@/lib/data/regions";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a missão do VIGIA, a diferença entre dado observado, previsto, simulado e alerta oficial, e como interpretamos informação ambiental.",
};

export default function SobrePage() {
  return (
    <div className="vigia-container flex max-w-3xl flex-col gap-10 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Sobre o VIGIA</h1>
        <p className="text-[color:var(--color-text-muted)]">
          O VIGIA é uma central regional de inteligência climática,
          meteorológica, hidrológica e ambiental para União da Vitória /
          Porto União, Cruz Machado / Santana, Bituruna e Inácio Martins.
          Não é um aplicativo de clima genérico: é um sistema pensado para
          ajudar pessoas comuns a perceber, compreender e agir diante de
          condições ambientais da própria região.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
          Como interpretamos os dados
        </h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Todo dado exibido no VIGIA carrega uma natureza explícita, para que
          você nunca confunda uma medição com uma estimativa:
        </p>
        <div className="flex flex-wrap gap-2">
          <NatureBadge nature="observado" />
          <NatureBadge nature="previsto" />
          <NatureBadge nature="simulado" />
          <NatureBadge nature="oficial" />
        </div>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-[color:var(--color-text-muted)]">
          <li><strong className="text-[color:var(--color-text)]">Observado</strong> — medido por uma estação ou sensor.</li>
          <li><strong className="text-[color:var(--color-text)]">Previsto</strong> — resultado de um modelo meteorológico.</li>
          <li><strong className="text-[color:var(--color-text)]">Simulado</strong> — cenário hipotético do VIGIA (ex: simulação de inundação), sempre com incerteza declarada.</li>
          <li><strong className="text-[color:var(--color-text)]">Alerta oficial</strong> — emitido por uma autoridade competente (defesa civil, órgão federal/estadual). O VIGIA nunca chama uma análise própria de alerta oficial.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">Regiões monitoradas</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {REGIONS.map((r) => (
            <li key={r.slug} className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] p-3">
              <p className="text-sm font-medium text-[color:var(--color-text)]">{r.name}</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-[color:var(--color-text)]">O que o VIGIA não faz</h2>
        <ul className="list-disc pl-5 text-sm text-[color:var(--color-text-muted)]">
          <li>Não declara segurança absoluta (&ldquo;100% seguro&rdquo;).</li>
          <li>Não substitui alertas oficiais de defesa civil.</li>
          <li>Não apresenta uma simulação como previsão garantida.</li>
        </ul>
      </section>
    </div>
  );
}
