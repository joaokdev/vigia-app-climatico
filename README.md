# VIGIA — FASE 1 (Frontend + Design + IHM)

> Status: **FASE 1 implementada e validada.** Aguardando aprovação explícita
> do proprietário para iniciar a FASE 2. Nenhum código de backend, banco de
> dados ou integração real foi escrito.

## Como rodar

```bash
cd app
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção (validado, sem erros)
npm run lint     # eslint (validado, sem erros)
```

## O que existe

### Design system (`src/app/globals.css`)
Tokens semânticos para cor, tipografia, espaçamento, motion, elevação e
z-index. Light e Dark completos via `data-theme`, mais uma paleta de dados
científicos (chuva/temperatura/risco) que **não muda com o tema**, porque
esses valores precisam manter significado constante.

**Decisão registrada:** a tipografia usa pilha de fontes de sistema, não
Google Fonts. Motivo: o ambiente de build não tem acesso de rede a
`fonts.googleapis.com`/`fonts.gstatic.com`, e depender disso quebraria o
build. Isso também elimina FOUT e qualquer dependência de licenciamento de
fonte externa. Par tipográfico: grotesk de sistema para UI, monoespaçada
tabular para dados numéricos (`font-data`).

### Tema (`src/lib/theme/theme-provider.tsx`)
Light / Dark / System, com persistência em `localStorage` e script inline no
`<head>` para eliminar flash de tema incorreto antes da hidratação.

### Marca (`src/components/brand/Logo.tsx`)
Único ponto de decisão de qual arquivo de logo usar. Regra fixa:
Light → `logo-black.png`, Dark → `logo-white.png`. Os arquivos originais
fornecidos (1254×1254 PNG) nunca foram redesenhados, deformados ou
substituídos — estão em `public/brand/` e preservados também em
`reference/logos-original/`.

### Efeitos de referência (`reference/efeitos-selecionados/`)
Os 6 pacotes de efeito fornecidos foram mantidos intactos como referência
(a licença permite uso comercial adaptado, não revenda/reupload do pacote em
si). Três princípios foram **reimplementados como código próprio** do VIGIA
(não copiados) porque agregavam valor real à experiência:

- `password-strength-visualiser` → `components/ui/PasswordStrength.tsx`
- `otp-verification` → `components/ui/OTPInput.tsx`
- `day-night-window-toggle` → `components/ui/ThemeSwitcher.tsx` (conceito de
  alternância dia/noite, implementação própria)
- `page-transitions` → `components/layout/PageTransition.tsx` (transições
  curtas, ~220ms, respeitando `prefers-reduced-motion`)

`hover-buttons-part-5` e `cool-loading-screens` foram avaliados e **não
usados diretamente** — a linguagem de botões e loading do VIGIA (ver
`Button.tsx`, `Skeleton` em `States.tsx`) foi desenhada para ficar coerente
com o restante do design system em vez de introduzir um estilo de terceiros
sem relação com a marca.

### Ícones (`src/components/icons/`)
Conjunto próprio (SVG, stroke consistente 1.75px) cobrindo todo o
vocabulário meteorológico/hidrológico/de interface necessário — nenhum ícone
de biblioteca genérica.

### Dados e mocks (`src/lib/`)
- `data/regions.ts` — metadados geográficos reais e estáveis das 4 regiões
  (não é dado meteorológico, não expira).
- `providers/types.ts` — contrato de dados que a UI conhece (`RegionSnapshot`,
  `WeatherSnapshot`, `RiverSnapshot`, `OfficialAlert`, `StationInfo`, com
  proveniência e natureza: observado/previsto/simulado/oficial).
- `providers/mock/index.ts` — **mock providers** isolados
  (`mockWeatherProvider`, `mockRiverProvider`, `mockAlertProvider`,
  `mockStationProvider`), claramente rotulados, com a mesma forma que os
  adapters reais terão na FASE 2.
- `providers/index.ts` — único ponto de acesso (`getRegionSnapshot`) que a UI
  importa. Trocar mock por dado real na FASE 2 é mudar esta função, não
  reescrever componentes.

Nenhum valor foi inventado para "parecer real" sem rótulo: toda tela que
mostra dado de demonstração explicita isso (rodapé, badges de
`NatureBadge`/`StatusBadge`, textos "Implementado visualmente como mock para
a FASE 1").

### Páginas implementadas
| Rota | Conteúdo |
|---|---|
| `/` | Estado do sistema, hero, alertas em destaque, 4 cards regionais, explicação do VIGIA |
| `/mapa` | Explorador de mapa com abas por região, legenda, camadas demonstrativas |
| `/cidade/[slug]` | Dashboard completo por região (clima, rio quando aplicável, estações, insight de IA demonstrativo) — 4 rotas estáticas geradas |
| `/sobre` | Missão, semântica de dados, o que o VIGIA não faz |
| `/fontes` | Fontes candidatas para a FASE 2 e o que falta verificar (licença, SLA) |
| `/login`, `/cadastro`, `/verificar-otp`, `/recuperar-acesso` | Fluxo de autenticação **visual**, com feedback explícito de que é mock |
| `/conta`, `/conta/preferencias`, `/conta/notificacoes` | Perfil, preferências (tema/unidades/canais) e central de notificações — dados fixos, sem persistência real |

### Mapas (FASE 1)
Cada região tem uma ilustração SVG esquemática própria e distinta (não são 4
mapas idênticos redimensionados) em `components/map/RegionIllustration.tsx`.
O `MapCard` já implementa o ciclo de vida que os mapas reais vão precisar:
`IntersectionObserver` para lazy init, estado de carregamento (`skeleton`),
estado indisponível/offline, indicador de dado desatualizado, camadas
alternáveis sob demanda e expansão para a página da cidade. A troca para
MapLibre GL JS com tiles reais na FASE 2 substitui apenas a ilustração
interna, não a arquitetura de ciclo de vida.

### Estados de IHM cobertos
Loading (`Skeleton`), vazio (`EmptyState`), erro (`ErrorState`), offline
(`OfflineState`), dado desatualizado (`DataFreshness` + `StatusBadge`), mapa
indisponível, alerta oficial (`AlertBanner`/`AlertCard`). Nenhum estado
depende só de cor: sempre há texto/ícone/rótulo acompanhando.

### Acessibilidade
Skip link, foco visível (`:focus-visible`), labels sempre visíveis nos
inputs, erros com `role="alert"`, `aria-live` no fluxo de OTP, toggle de
tema como `radiogroup`, ícones com `aria-label`, `prefers-reduced-motion`
respeitado globalmente.

## Validação executada

- [x] `npm run build` — 17 rotas, sem erros, sem warnings
- [x] `npx tsc --noEmit` — sem erros de tipo
- [x] `npx eslint .` — sem erros nem warnings no código do app
- [x] Smoke test HTTP de todas as rotas (servidor de produção): todas 200,
      exceto `/cidade/rota-invalida` → 404 (comportamento correto)
- [x] Assets de marca (`logo-black.png`, `logo-white.png`) servidos com 200
- [x] Contraste WCAG AA verificado programaticamente para os pares
      texto/fundo do design system (Light e Dark). Um problema real foi
      encontrado e corrigido: `--color-text-subtle` e `--color-warning` no
      Light Mode ficavam abaixo de 4.5:1 em texto pequeno (3.30:1 e 3.69:1);
      ambos foram escurecidos e agora passam (5.20:1 e 5.96:1)
- [ ] Teste manual de Light/Dark/System, teclado e leitor de tela pelo
      proprietário — recomendado antes da aprovação da fase

## Limitações conhecidas (declaradas, não escondidas)

- Todo dado climático/hidrológico é **mock**, centralizado e rotulado.
  Nenhuma API externa real (Open-Meteo, INMET, ANA, CEMADEN, RainViewer) foi
  integrada.
- Os mapas são ilustrações esquemáticas SVG, não MapLibre GL JS com tiles
  reais — a arquitetura de ciclo de vida está pronta para a troca.
- Autenticação, cadastro, OTP e recuperação de senha são **visuais**: não há
  backend, hashing de senha, sessão ou banco de dados.
- Preferências de conta e notificações usam estado local do React — nada é
  persistido.
- `/conta` não é protegida por sessão (não existe sessão na FASE 1).

## Próximo passo

Aguardando autorização explícita do proprietário ("Pode iniciar a FASE 2.")
para começar backend, PostgreSQL/PostGIS, Redis, autenticação real e
integração com APIs externas.
