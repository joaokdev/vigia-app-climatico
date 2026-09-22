import type { Metadata } from "next";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

/**
 * Página de referência interna sobre fontes de dados candidatas —
 * conteúdo técnico (nomes de API, status de integração) que não deve
 * aparecer para o usuário final. Por isso não está mais linkada no
 * Header nem no Footer; o arquivo continua existindo para consulta
 * interna da equipe, não como parte da navegação do produto.
 */

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
    name: "SIMEPAR (Paraná)",
    domain: "Meteorologia oficial do estado do Paraná",
    status: "Pista real encontrada — sem API JSON documentada",
    note: "Descoberta nesta sessão: o SIMEPAR mantém uma estação chamada literalmente \"União da Vitória\" com dado público ao vivo (simepar.br/simepar/dados_estacoes/26145103). É uma fonte melhor que a Open-Meteo para essa região especificamente (estação real no local, não interpolação de modelo global) — mas só existe como página HTML, sem API JSON documentada. Não construímos um raspador de HTML como integração \"real\": quebraria silenciosamente se o SIMEPAR mudar o layout da página, e isso violaria o princípio de nunca mostrar dado errado como se fosse bom. Vale contatar o SIMEPAR perguntando por acesso a dados estruturados antes de tentar automatizar isso.",
  },
  {
    name: "ANA — HidroWebService",
    domain: "Hidrologia (nível de rio, vazão, chuva)",
    status: "Caminho de acesso identificado — credencial pendente",
    note: "Fonte prioritária para o Rio Iguaçu em União da Vitória / Porto União. Existe um webservice antigo sem credencial, mas a própria ANA já anunciou seu desligamento (prorrogado até 30/06/2026) — não vale construir sobre algo que a própria agência está desligando. A API nova (HidroWebService) exige credencial: enviar e-mail para hidro@ana.gov.br com assunto \"Solicitação de acesso à API\", informando nome/instituição, CPF ou CNPJ e o e-mail de contato. A aprovação é manual, feita pela equipe da ANA.",
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
