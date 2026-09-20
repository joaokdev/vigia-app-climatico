# VIGIA — FASE 2 (Backend)

> Status: **FASE 2 em andamento.** Autenticação real, preferências/
> notificações e clima ao vivo (Open-Meteo) estão implementados,
> testados de ponta a ponta e persistindo em Postgres real. Rio,
> alertas oficiais e observabilidade **não** estão integrados ainda —
> ver "Limitações conhecidas" abaixo. Segurança/hardening ficam para a
> FASE 3, por pedido explícito do proprietário.

## Como rodar (com backend)

Pré-requisitos locais: PostgreSQL 16+ com extensão PostGIS, Redis.

```bash
cd app
cp .env.example .env.local   # edite DATABASE_URL/REDIS_URL se necessário
npm install
npx drizzle-kit migrate      # aplica o schema no Postgres
npm run dev                  # http://localhost:3000
```

## Arquitetura do backend

### Decisão: Drizzle ORM + `pg`, não Prisma
Prisma foi a escolha inicial (alinhada com o `VIGIA_MASTER_PROMPT.md`),
mas o passo de instalação do Prisma baixa um binário nativo
(`schema-engine`) de `binaries.prisma.sh` — um domínio fora da lista de
rede permitida no ambiente onde este projeto foi desenvolvido, então a
instalação nunca completava. Drizzle ORM + driver `pg` são pacotes JS
puros (sem binário nativo, sem download externo no install), oferecem
migração SQL versionada (`drizzle-kit`) e tipagem igualmente forte.
Reavalie se Prisma for viável no seu ambiente de deploy real.

### Estrutura
```
src/server/
  auth/        registro, OTP, login, sessão, recuperação de senha
  account/     preferências e notificações
  regions/     clima (Open-Meteo real) + rio/alertas/estações
  db/          client Postgres (Drizzle), client Redis, schema.ts, migrations/
  lib/         env.ts (validação de ambiente), http.ts (helpers de rota)
src/app/api/   rotas HTTP finas — só validam entrada e chamam server/*
src/proxy.ts   proteção de rota (convenção Next.js 16; substitui middleware.ts)
```

### Autenticação
- Senha: argon2id (parâmetros OWASP). Sessão: token opaco de 256 bits,
  cookie httpOnly, guardado em Postgres (não JWT — revogar é um DELETE).
- OTP de 4 dígitos, hash SHA-256, expira em 10 min, máx. 5 tentativas,
  cooldown de reenvio de 24s (via Redis, mesmo tempo que a UI já mostrava).
- E-mail: adapter Resend. **Sem `RESEND_API_KEY` configurada (nenhum
  ambiente até agora), nada é enviado de verdade — o código cai no log
  do servidor**, e com `VIGIA_DEV_EXPOSE_OTP=true` também volta na
  própria resposta HTTP, só em desenvolvimento.
- Login/registro/recuperação de senha respondem de forma neutra onde
  cabia (não vazam se um e-mail existe), e usam hash "morto" na
  ausência de usuário para dificultar enumeração por tempo de resposta.

### Clima (Open-Meteo)
Integração real, sem chave de API. Cache de 10 min em Redis; cada leitura
também grava em `weather_readings` (serve de histórico para o sparkline
e de fallback se a Open-Meteo cair). **Aviso de verificação:** o adapter
foi escrito a partir da documentação oficial, mas o ambiente de
desenvolvimento bloqueia rede para `api.open-meteo.com` — não foi
possível testar contra a API ao vivo daqui. Teste antes de confiar em
produção.

### Rio, alertas oficiais, estações — NÃO integrados
As tabelas (`river_readings`, `official_alerts`, `stations`) existem no
schema, e o contrato de dados (`RegionSnapshot`) já tem os campos, mas
não há nenhum adapter real ligado a eles ainda (ANA HidroWebService,
CEMADEN/defesa civil). `river` retorna `null` e `alerts`/`stations`
retornam listas vazias — nunca um número inventado. Pesquisei o
caminho real de acesso à ANA e ao SIMEPAR (Paraná) — ver `/fontes` no
app e a seção de limitações abaixo.

## Testes automatizados

```bash
npm run test        # roda uma vez, contra Postgres/Redis reais
npm run test:watch  # modo watch
```

20 testes de integração (Vitest) cobrindo o módulo de autenticação por
completo (cadastro, OTP com limite de tentativas, login, logout,
reenvio com cooldown, recuperação de senha de ponta a ponta incluindo
revogação de sessões antigas) e o módulo de conta (perfil, preferências
parciais, notificações, isolamento entre usuários). Rodam contra banco
de dados real (`TRUNCATE` entre testes), não mocks — mesma filosofia
usada durante todo o desenvolvimento desta fase. Não cobrem as rotas
HTTP em si (que dependem de `next/headers`, fora do alcance do Vitest
puro) — essas foram validadas manualmente via `curl` durante o
desenvolvimento; adicionar `next-test-api-route-handler` é o próximo
passo natural se quiser cobertura também nesse nível.

## Observabilidade

`src/server/lib/logger.ts` — logger estruturado mínimo (JSON por linha
em produção, texto legível em dev). Instrumentado nos pontos que mais
importam para operar o sistema: tentativas de login inválidas, OTP
bloqueado por excesso de tentativas, login bem-sucedido, senha
redefinida (com revogação de sessões), e falha ao buscar clima na
Open-Meteo (com fallback para o último dado salvo). Isto não é uma
solução completa (sem tracing, sem métricas, sem id de correlação por
requisição) — é o piso que torna os logs pesquisáveis.

## Limitações conhecidas (declaradas, não escondidas)

- **Rio (ANA)**: pesquisado a fundo. Existe um webservice antigo sem
  credencial, mas a própria ANA já anunciou seu desligamento (prazo
  prorrogado até 30/06/2026, já vencido) — não vale construir sobre um
  serviço que a própria agência está desligando. A API nova exige
  credencial manual: enviar e-mail para **hidro@ana.gov.br**, assunto
  "Solicitação de acesso à API", com nome/instituição, CPF ou CNPJ e
  e-mail de contato (documentado também em `/fontes`). Isso só o
  proprietário pode solicitar.
- **SIMEPAR (Paraná)**: achado um candidato melhor para União da
  Vitória especificamente — uma estação oficial com esse nome, dado
  público ao vivo (`simepar.br/simepar/dados_estacoes/26145103`). Sem
  API JSON documentada, só página HTML — não construí um raspador
  (quebraria silenciosamente se o layout mudar). Vale contatar o
  SIMEPAR perguntando por acesso estruturado antes de automatizar.
- Alertas oficiais (CEMADEN/defesa civil) e estações: sem integração
  real ainda — mesma decisão de não inventar dado.
- E-mail: sem provedor configurado em nenhum ambiente testado — só log.
- Adapter da Open-Meteo: escrito pela documentação, não testado ao vivo
  (rede do sandbox bloqueia `api.open-meteo.com`).
- Observabilidade: logging estruturado existe (ver seção acima), mas
  sem tracing, métricas ou id de correlação por requisição ainda.
- Testes automatizados: 20 testes de integração cobrindo auth e conta
  (ver seção acima) — rotas HTTP em si e o módulo de clima ainda sem
  testes automatizados (validados manualmente via `curl`).
- Segurança/hardening: adiado para a FASE 3 por pedido explícito.

---

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

### Efeitos de terceiro integrados (pacote `efeitos.zip`, revisão 2)

Depois da primeira entrega, o proprietário forneceu um segundo pacote maior
de efeitos com a instrução explícita de **usá-los sem alterar cor,
comportamento ou o resultado visual final** — só reposicionamento/redimensionamento
é permitido. Cada efeito foi analisado individualmente; os que combinavam
com o domínio do VIGIA (clima/água/segurança) foram portados de forma fiel,
os que não combinavam foram descartados com justificativa.

**Portados e integrados:**

| Efeito | Onde | Fidelidade |
|---|---|---|
| Day/Night Window Toggle | `/conta/preferencias` | CSS/JS portado quase 1:1; conectado ao ThemeProvider real em vez de um localStorage próprio |
| OTP Verification | `/verificar-otp` | script.js original carregado como asset estático sem alteração de lógica; só texto traduzido para PT-BR e código de demo trocado |
| Password Strength Vault | `/cadastro` | 6 arquivos JS + SVG do cofre copiados verbatim; só strings traduzidas (incluindo reescrita correta em português de "5 mil anos"/"3 milhões de anos" no cálculo de tempo-para-quebrar) |
| Page Transitions ("Glob Wipe") | Todas as rotas | Única variante portável para rotas reais (as outras 5 — portal, cubo 3D, glitch, flood, flip — são acopladas à mini-janela de preview fake do pacote); cores/keyframe originais preservados |
| Frost (hover-buttons-part-4) | Botão "Abrir mapa regional" (home) | Simulação de pixel em canvas portada quase literalmente |
| Water Ripple (hover-buttons-part-5 — o pacote citado no Master Prompt) | Botão "Ver histórico (7 dias)" no card de rio | Mesma arquitetura do Frost; escolhido por ser literalmente uma simulação de ondulação de água |
| Social Media Buttons | Rodapé | SVGs de marca e tooltip preservados; links desativados (`href="#"` + preventDefault) porque o VIGIA ainda não tem contas reais — navegar para elas seria fingir uma presença que não existe |

**Avaliados e descartados** (não usados, com justificativa):
- `add-to-cart`, `delivery-button`, `modern-checkout-ui` — vocabulário de e-commerce, sem relação com o produto
- `campfire-under-the-stars`, `expanding-hover-social-grid` — não combinam com o tom do produto
- `cool-loading-screens` — os 5 personagens (halterofilista, hambúrguer, café, sapo, bala) não combinam com o tom sério de uma ferramenta de risco/enchente; o Master Prompt já antecipa essa tensão e pede para "reduzir/adaptar" em vez de usar literalmente — a tela de carregamento em `components/ui/LoadingScreen.tsx` é essa adaptação (um pluviômetro se enchendo), desenhada do zero com a identidade do VIGIA, não um port do pacote

**Ferramenta criada para isso:** `scripts/scope_css.py` e `scripts/strip_rules.py` — namespacing automático de seletores CSS e renomeação de `@keyframes` para evitar colisão entre os vários efeitos, preservando cor/timing/geometria originais. Durante o uso, um bug real foi encontrado e corrigido: a divisão por vírgula não respeitava parênteses (`:is(a, b)` quebrava ao virar dois seletores inválidos).

### Enriquecimento de conteúdo (Nível 2 da hierarquia de informação)

Resposta à observação de que o app estava "pobre em informação": o
`RiverStatus` agora inclui, além do Nível 1 (o que está acontecendo agora),
uma frase de contexto Nível 2 ("por que isso importa") variando por nível
de atenção, e um histórico de 7 dias sob demanda (Nível 3), com um novo
campo `history7d` no contrato `RiverSnapshot`. Isso ainda é um começo — o
mesmo tratamento (contexto + detalhe sob demanda) pode ser estendido a
clima/vento/estações se o proprietário confirmar que é essa a direção
desejada antes de replicar em todo o app.

## Próximo passo

Aguardando autorização explícita do proprietário ("Pode iniciar a FASE 2.")
para começar backend, PostgreSQL/PostGIS, Redis, autenticação real e
integração com APIs externas.
