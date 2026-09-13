import type { Metadata } from "next";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

export const metadata: Metadata = {
  title: "Fontes de dados",
  description:
    "Fontes de dados meteorológicos, hidrológicos e de risco candidatas para o VIGIA, e o status atual de cada integração.",
};

const SOURCES = [
  {
    name: "Open-Meteo",
    domain: "Meteorologia / modelagem",
    status: "Candidata — não integrada na FASE 1",
    note: "Fonte candidata principal para temperatura, chuva, vento e nuvens. Licença e termos de uso comercial serão verificados antes da integração na FASE 2.",
  },
  {
    name: "INMET",
    domain: "Observações de estações (Brasil)",
    status: "Candidata — não integrada na FASE 1",
    note: "Rede oficial de estações meteorológicas automáticas. Cobertura para as quatro regiões será verificada na FASE 2.",
  },
  {
    name: "ANA — HidroWebService",
    domain: "Hidrologia (nível de rio, vazão, chuva)",
    status: "Candidata — não integrada na FASE 1",
    note: "Fonte prioritária para o Rio Iguaçu em União da Vitória / Porto União. Requer verificação de autenticação e disponibilidade de estações na região.",
  },
  {
    name: "CEMADEN",
    domain: "Risco e alertas de desastre",
    status: "Candidata — não integrada na FASE 1",
    note: "Fonte oficial para riscos ambientais. Nenhuma interpretação do VIGIA substituirá um alerta do CEMADEN.",
  },
  {
    name: "RainViewer",
    domain: "Radar de chuva",
    status: "Em avaliação de licença",
    note: "Termos atuais indicam uso gratuito voltado a projetos pessoais/educacionais/comunitários pequenos, sem SLA. Uso comercial exige confirmação prévia dos termos vigentes.",
  },
] as const;

export default function FontesPage() {
  return (
    <div className="vigia-container flex max-w-3xl flex-col gap-6 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-display text-[color:var(--color-text)]">Fontes de dados</h1>
        <p className="text-[color:var(--color-text-muted)]">
          Na FASE 1, o VIGIA não consome nenhuma API externa real — toda a
          interface usa dados de demonstração centralizados e claramente
          identificados. Esta página documenta as fontes candidatas
          pesquisadas para a FASE 2 e o que ainda precisa ser verificado antes
          de qualquer integração (licença, uso comercial, limites, SLA).
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-[color:var(--color-border)] rounded-[var(--radius-lg)] border border-[color:var(--color-border)]">
        {SOURCES.map((s) => (
          <li key={s.name} className="flex flex-col gap-1.5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[color:var(--color-text)]">{s.name}</span>
              <DataSourceBadge source={s.domain} />
            </div>
            <p className="text-xs font-medium text-[color:var(--color-warning)]">{s.status}</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">{s.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
