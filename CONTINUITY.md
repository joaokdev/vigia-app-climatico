# IG (VIGIA) — CONTINUITY

## Estado atual (ETAPA 7 — login obrigatório + Split Panel Auth + tema nos efeitos)

Sétima etapa. Três pedidos do proprietário, todos validados com
Chromium real (Playwright), não por leitura de código.

### Extra concluído depois da entrega da ETAPA 7 (sem precisar de decisão do proprietário)
- **Tap targets pré-existentes corrigidas**: ícones sociais do rodapé
  (causa real: `scale-[0.55]` no wrapper, que encolhia a área de toque
  junto — o efeito social-links agora aceita `--smb-button-size` de
  fora em vez de um valor fixo no próprio elemento), botão "Abrir
  menu" do header, e `suggest-btn`/`visibility-btn` do Vault (área de
  toque ampliada via pseudo-elemento, sem mudar o tamanho visual
  aprovado). Atenção: `.visibility-btn` já é `position: absolute` e
  NÃO pode virar `relative`. Confirmado com `elementFromPoint`, não só
  `getBoundingClientRect` — que continua acusando esses 3 como
  "pequenos" mesmo corrigidos, porque mede só a caixa visual.
- **Header mostrava "Entrar"/"Criar conta" mesmo autenticado**: como o
  login agora é obrigatório, quem vê o Header numa rota protegida já
  está logado por definição. O Header checa `isPublicRoute` e troca
  para um ícone "Minha conta" (→ `/conta`) fora das rotas de auth —
  ajustado no header desktop e no drawer mobile.

### 1. Vault e OTP agora seguem o tema (bug real corrigido)
Os dois efeitos tinham `color-scheme: dark` e ~90 cores hardcoded —
ficavam presos no visual escuro mesmo com o app no tema claro (o mesmo
padrão de bug do Day/Night Toggle da etapa anterior). Os tokens locais
de cada um agora apontam para as variáveis semânticas de
`globals.css`, e os estados (ativo/erro/processando/sucesso) e bordas
sutis passaram a ser derivados via `color-mix()` — assim funcionam nos
dois temas sem precisar de um valor escrito à mão por tema. Nenhuma
animação/timing foi tocada. Confirmado por screenshot nos dois temas.

### 2. Login/cadastro obrigatórios (gate de sessão mock)
- `src/lib/auth/session.ts`: flag em localStorage + `authGateInitScript`
  (roda no `<head>`, antes da hidratação, como o `themeInitScript`) que
  redireciona para `/login` sem piscar conteúdo protegido.
- `src/components/auth/AuthGate.tsx`: rede de segurança para navegações
  client-side do Next (que não recarregam o `<head>`).
- Rotas públicas: `/login`, `/cadastro`, `/verificar-otp`,
  `/recuperar-acesso`.
- A sessão é marcada no sucesso do login e no sucesso do OTP (não no
  submit do cadastro). `/conta` ganhou um "Sair" funcional
  (`SignOutButton`) para dar pra testar o ciclo de novo.
- Confirmado: `/` e `/mapa` sem sessão → `/login`; `/recuperar-acesso`
  não redireciona; login → home com sessão criada; cadastro → OTP
  ainda SEM sessão.

### 3. Efeito "Split Panel Auth" (login-signup-animation) integrado
Porte fiel para React em `src/components/effects/split-panel-auth/`.
Preservados: `SWITCH_DURATION` 900ms, guarda de animação em andamento,
reflow forçado para reiniciar o light-sweep, clip-path/stagger. Só cor,
dimensão, idioma e a ação pós-submit mudaram. A paleta rosa/roxo/azul
do pacote virou a família azul-água/teal já usada no app. O Vault
substitui o par senha/confirmar-senha no lado de cadastro.
`/login` e `/cadastro` agora renderizam essa tela única (via
`SplitAuthShell`, variante larga do AuthShell).

### Bugs reais encontrados e corrigidos durante a validação
- **Painel oculto interceptava cliques**: com `pointer-events: auto` no
  formulário, o painel invisível bloqueava o botão de enviar do painel
  visível (fatal no mobile, onde os dois se sobrepõem). Só o painel
  ativo recebe ponteiro agora. Achado porque o teste de fluxo real
  falhou com timeout — não apareceria em leitura de código.
- **Painel oculto era focável por Tab**: resolvido com `inert`.
- **Botão de enviar espremido a 31px**: filhos do formulário flex
  encolhiam; `flex-shrink: 0` restaurou os 48px.
- **Tokens mobile em `:root` não venciam** os declarados no próprio
  `.split-auth-root` (mesma especificidade, mesmo elemento) — o layout
  mobile do pacote simplesmente não aplicava. Reescopados.
- **Altura mobile única cortava o cadastro**: login (~535px) e cadastro
  (~741px) têm alturas bem diferentes, e no estado "cadastro" o overlay
  desliza para o rodapé cobrindo os últimos 190px. Agora cada painel
  tem sua altura e o formulário é ancorado no topo no mobile.
- **Tap targets** de `.checkbox-label` e `.form-link` estavam com ~20px
  de altura no mobile → 44px de área clicável (WCAG), sem mudar o
  tamanho visual do texto.
- **Reduced-motion do pacote era global** (`*`), vazaria para o app
  inteiro — reescopado para `.split-auth-root`.

### Testes (ETAPA 7)
- `npx tsc --noEmit`, `npx eslint .`, `npm run build` — limpos.
- Smoke das 15 rotas em mobile (390), tablet (820) e desktop (1440):
  0 overflow horizontal, 0 erro de JS, nenhum redirect indevido.
- Screenshots reais de `/login` e `/cadastro` nos dois temas, desktop e
  mobile, incluindo o estado pós-troca de painel.

### Pendências
- `expanding-hover-menu.zip` foi enviado mas **não integrado** — falta
  o proprietário dizer onde ele deve entrar (header? menu mobile?).
- Revisão humana de gosto na transição de página (pendência da ETAPA 5).

### Tap targets pré-existentes — CORRIGIDOS (fim da ETAPA 7)
- **Ícones sociais do rodapé (29px)**: a causa era `scale-[0.55]` no
  wrapper do Footer, que encolhia junto a área de toque. O efeito
  passou a aceitar override do tamanho (`--smb-button-size`) em vez de
  declarar um valor fixo no próprio elemento (que vencia qualquer
  herança e forçava o uso de `transform: scale`). Agora 44x44 reais.
- **Botão "Abrir menu" do header (40px)**: tamanho visual mantido (o
  design já estava aprovado); a área clicável foi ampliada para 48x48
  com pseudo-elemento. O primeiro valor tentado (`-inset-0.5`, 44x44
  exatos) falhou no teste de ponto por arredondamento — só passou em
  4/4 com `-inset-1`.
- **`suggest-btn` (26px) e `visibility-btn` (38px) do Vault**: mesma
  técnica, `::after` com `min-width/min-height: 44px`. Atenção:
  `.visibility-btn` já é `position: absolute` e NÃO pode receber
  `position: relative` (quebra o posicionamento) — o absolute já serve
  de contexto para o pseudo-elemento.
- Verificação: o script que mede só `getBoundingClientRect` continua
  listando esses três como "abaixo de 44px", porque a caixa VISUAL não
  mudou de propósito — a área de toque real foi confirmada à parte com
  `elementFromPoint` (4/4 nos pontos de borda de um alvo de 44px).
  Cuidado com um falso negativo nesse teste: `elementFromPoint` só
  funciona dentro da viewport, então elementos abaixo da dobra (como o
  rodapé) retornam `null` sem que haja problema algum.

---

## Estado atual (ETAPA 6 — reduced-motion, reduced-transparency e acessibilidade real)

Sexta etapa. Escopo: fechar a pendência nº1 deixada no fim da ETAPA 5
("`prefers-reduced-motion` e leitor de tela reais continuam sem teste
com ferramenta real") — desta vez com o mesmo navegador real
(Chromium via Playwright, `/opt/pw-browsers`) usado nas etapas 4 e 5,
em vez de só ler o CSS. Nenhum arquivo de componente foi alterado
nesta sessão — foi puramente investigação/validação; tudo que segue
foi CONFIRMADO, não presumido.

### O que foi testado e o resultado

1. **`prefers-reduced-motion: reduce` real (via `context.reducedMotion`
   do Playwright), nas 12 rotas do master prompt:** a regra global em
   `globals.css` (`animation-duration`/`transition-duration:
   0.001ms !important`) funciona de ponta a ponta — medi a maior
   `animation-duration`/`transition-duration` computada em qualquer
   elemento de cada página, em ambos os estados. Sem a preferência,
   valores normais (220–1150ms; um pico de 82000ms em
   `/conta/preferencias`, que é uma animação ambiente lenta do
   Day/Night Toggle — está bem longe da faixa de ~5s/ciclo que a
   Apple Design Skill pede pra evitar, então não é um problema). Com
   a preferência ativa, **0ms em todas as 12 rotas**, confirmando que
   nenhum efeito de terceiro escapa da regra global.
2. **`prefers-reduced-transparency: reduce` real (via CDP
   `Emulation.setEmulatedMedia`)** nas 4 páginas com `AuthShell`
   (login, cadastro, recuperar-acesso) + verificar-otp: o
   `.auth-ambient-glow` (o glow radial de fundo) confirma
   `display: none` corretamente nas 3 páginas que o usam.
   `/verificar-otp` não usa `AuthShell` (é uma página própria, sem o
   glow desde a origem) — não é uma lacuna, é um layout diferente que
   já existia antes desta sessão.
3. **Aproximação de leitor de tela (árvore de acessibilidade real via
   `page.accessibility.snapshot`)** em 8 rotas centrais: nenhum
   elemento interativo (`textbox`/`button`/`combobox`/`image`) sem
   nome acessível ou alt. Landmarks (`main`/`nav`/`header`/`footer`)
   presentes em todas. Regiões `aria-live`/`role="alert"` confirmadas
   funcionando de verdade no DOM: o banner de alerta oficial na home
   (`role="alert"`), o status ao vivo do Vault e do OTP
   (`aria-live="polite"`), e o rótulo do Day/Night Toggle.
4. **Ordem de tab real (`Keyboard.press('Tab')`)** em `/cadastro` e
   `/verificar-otp`: ordem correta e previsível (skip-link → logo →
   nav → tema → notificação → entrar/criar conta). Um resultado
   inicialmente estranho em `/verificar-otp` (Tab parecia pular
   direto pro rodapé) foi investigado e **não é bug**: o campo OTP
   recebe autofocus real no carregamento (confirmado via
   `document.activeElement` antes de qualquer Tab), e o
   `resend-button` fica `disabled` durante o cooldown — por isso o
   navegador o pula corretamente, e o `continue-button` fica oculto
   até o código ser válido. Comportamento nativo esperado do
   navegador, confirmado, não um problema de foco perdido.

### Testes (ETAPA 6)
- `npm install`, `npx tsc --noEmit`, `npx eslint .`, `npm run build`
  — todos limpos (17 rotas), antes de qualquer teste de navegador.
- `next start` (produção) + scripts Playwright dedicados para cada um
  dos 4 itens acima.

### Pendência que permanece (não fechada nesta etapa, é subjetiva)
- Revisão humana final de gosto/sensação na transição de página
  ("Glob Wipe" em tons de água) — já registrada como pendência de
  direção na ETAPA 5, continua sendo decisão do proprietário, não
  algo que um script possa validar.

---

## Estado atual (ETAPA 5 — revisão profunda de UX/UI + mobile Android)

Quinta etapa, com uma prioridade diferente das anteriores: não bastava
mais confirmar "não existe overflow" — o pedido explícito foi avaliar
se o produto é **realmente utilizável num Android real** (360–412px) e
corrigir problemas de composição/UX encontrados numa revisão visual
concreta (print do cadastro/Vault fornecido pelo proprietário).

Trabalho feito com o mesmo ambiente com navegador real (Chromium via
Playwright, `/opt/pw-browsers`) usado na ETAPA 4: build de produção
(`next build` + `next start`), varredura de **12 rotas × 2 temas ×
6 breakpoints** (360/390/412/768/1366/1920) checando overflow
horizontal e console/pageerror, mais screenshots dirigidos das telas
mais críticas (Header, Drawer, Cadastro/Vault, transição de página).

### Problemas reais encontrados (não só leitura de código — confirmados no navegador)

1. **Sino de notificação sempre visível, em qualquer largura.**
   `IconButton` inclui `inline-flex` fixo nas próprias classes-base.
   Quando o Header tentava escondê-lo no mobile passando
   `className="hidden sm:inline-flex"` (ETAPA 3/4) — e depois
   `"hidden md:inline-flex"` nesta sessão —, o CSS gerado pelo
   Tailwind coloca a regra incondicional `.inline-flex` **depois** de
   `.hidden` no arquivo final; como as duas são incondicionais fora
   do range de mídia ativo, a que vem depois no source vence,
   independente da ordem das classes no HTML. Resultado: o sino
   NUNCA ficava de fato escondido, em nenhuma largura — não era só a
   faixa 640–767px que a ETAPA 4 não tinha como pegar (aquilo
   verificava overflow/erro de console, não "este elemento deveria
   estar invisível e não está"). Essa é provavelmente a causa raiz do
   que o proprietário via como "controles competindo com o menu" no
   Android. **Correção:** o sino agora vive dentro de um `<div
   className="hidden md:inline-flex">` sem nenhuma classe-base
   conflitante — confirmado via `getComputedStyle`/`isVisible()` em
   360/700/768/900px que ele some corretamente abaixo de `md` e
   aparece a partir dali.
2. **Zona 640–767px com hambúrguer E os controles desktop juntos.**
   Notificação/tema/Entrar/Criar conta usavam o breakpoint `sm`
   (640px) enquanto o hambúrguer só sumia em `md` (768px) — entre os
   dois, ambos os conjuntos de controle apareciam ao mesmo tempo.
   Unificado tudo para `md`: agora existe um único ponto de corte
   "modo desktop vs modo mobile" no Header inteiro.
3. **Overflow horizontal real no Vault em 360–390px.**
   `.vault-root` tinha `min-width: 320px`. Dentro do card de
   cadastro (`AuthShell`) em 360–390px de viewport, a largura real
   disponível para o Vault (viewport − padding da página − padding
   do card) já fica abaixo de 320px — então esse mínimo forçava o
   Vault a ser mais largo que o próprio card. Efeito
   contra-intuitivo: como o componente é fluido por dentro
   (`clamp()`/`minmax()`/`1fr` em quase tudo), ele continuava
   "parecendo" responsivo — só o piso artificial de 320px é que
   quebrava. Removido; confirmado `scrollWidth === clientWidth` em
   360/390/412px em todas as 12 rotas nos dois temas.
4. **Vault dominando a tela no cadastro mobile (o problema do print).**
   Confirmado visualmente: com a ilustração em até 260px de largura
   sozinha, o Vault ocupava mais altura de tela do que Nome + E-mail
   + Senha juntos, empurrando "Continuar" para fora da área
   confortável de toque. Texto do rótulo "Sugerir senha forte"
   também ficava colado na borda da "ilha escura" (sem padding
   próprio — o pacote original tinha uma página inteira ao redor do
   efeito, que não foi trazida para dentro do formulário).

### O que foi corrigido nesta sessão (ETAPA 5)

**Header / Drawer / navegação**
- `src/components/layout/Header.tsx` — sino de notificação envolvido
  em `<div>` (ver problema 1); breakpoint unificado para `md` (ver
  problema 2); Drawer mobile reconstruído: item ativo destacado
  (`aria-current` + fundo), toque maior (`py-3`, `text-[15px]`),
  "Criar conta" agora é um botão sólido (ação primária de verdade,
  não mais um link igual aos outros), notificação também presente no
  Drawer para paridade com o desktop.
- `src/components/ui/Drawer.tsx` — trava o scroll do `body` enquanto
  aberto (antes o conteúdo atrás rolava junto com o Drawer — dois
  scrolls competindo, sensação de site quebrado no Android);
  `overflow-y-auto` interno para o caso de o menu crescer;
  `env(safe-area-inset-bottom)` para não colar no gesture bar;
  botão fechar aumentado de `size="sm"` (32px) para o padrão (40px).

**Cadastro / AuthShell / Password Vault**
- `src/components/auth/AuthShell.tsx` — logo 76→64px, padding da
  página `py-12`→`py-8 sm:py-12`, card `p-7`→`p-5 sm:p-8`: no
  Android isso libera espaço vertical real sem sacrificar
  reconhecimento de marca (64px ainda é claramente um logo, não um
  favicon).
- `src/components/effects/password-strength/password-strength.css` —
  reescrita da composição mobile (ver problemas 3 e 4): `min-width`
  removido; `.vault-root` ganhou padding e `border-radius` próprios
  (agora é um cartão de verdade, não um retângulo cru colado nas
  bordas); novo breakpoint ≤560px muda o cartão de força de
  "ilustração 260px empilhada + texto embaixo" para **layout
  horizontal compacto** (selo de 64px ao lado do texto, como um
  badge de status); ≤480px aperta ainda mais (52px). Título/mensagem/
  entropia com tipografia reduzida nesses breakpoints. A
  funcionalidade (entropia, tiers, animação GSAP com fallback,
  mostrar/ocultar senha) não foi tocada — só CSS de layout.
- `src/components/ui/Input.tsx` — campo `h-11`→`h-12` (44→48px, meta
  de toque confortável) e fonte `15px`→`16px` (abaixo de 16px o
  Safari/iOS dá zoom automático ao focar; 16px evita isso em
  qualquer navegador). Botão de mostrar/ocultar senha reposicionado
  para acompanhar a nova altura.
- `src/app/login/page.tsx`, `src/app/cadastro/page.tsx`,
  `src/app/recuperar-acesso/page.tsx` — botão de submit principal
  `size="lg"` (48px): ação primária mais clara e com alvo de toque
  maior.

**Transição de página**
- `src/components/effects/page-transition/glob-wipe.css` e
  `src/components/layout/PageTransition.tsx` — evolução do "Glob
  Wipe": era um único blob rosa/roxo/ciano-turned-água cruzando a
  tela em 1000ms; agora são duas camadas atmosféricas (um halo mais
  suave + uma faixa diagonal com bordas por gradiente, não por
  blur), ambas entrando/saindo em opacidade, ~620ms no total (dentro
  da faixa 350–700ms pedida). Só `transform`/`opacity` são animados
  por frame; `filter: blur()` é estático por camada. Confirmado
  visualmente com screenshots em frames intermediários (80/200/
  320ms) — a névoa entra suave, cobre o conteúdo no pico e sai sem
  corte abrupto; `prefers-reduced-motion` continua desativando o
  efeito por completo (`display: none`).

### Testes (ETAPA 5)
- `npx tsc --noEmit` — sem erros.
- `npx eslint .` — sem erros nem warnings.
- `npm run build` — 17 rotas, sem erros.
- Varredura Playwright: **12 rotas × 2 temas × 6 breakpoints (360,
  390, 412, 768, 1366, 1920) = 144 combinações, 0 com overflow
  horizontal, 0 com erro real de console** (o único "erro" que
  aparece continua sendo o 403 de rede do GSAP via CDN, já
  documentado como limitação do sandbox, não do projeto).
- Verificação dirigida: Header/Drawer em 360/700/768/900px
  (`getComputedStyle`/`isVisible()` no sino e no hambúrguer, não só
  screenshot); Cadastro em 360/390 nos dois temas (screenshot +
  inspeção de crop na região do rótulo "Senha"/"Sugerir senha
  forte"); Drawer aberto em 375/412 nos dois temas; frames
  intermediários da transição de página (80/200/320ms).
- Não testado nesta sessão (mesma limitação já registrada na ETAPA
  4): `prefers-reduced-motion` e leitor de tela reais — a regra CSS
  existe e foi lida no código, mas não houve verificação com
  navegador em modo reduced-motion real nem com leitor de tela.

### Arquivos modificados (ETAPA 5)
- `src/components/layout/Header.tsx`
- `src/components/ui/Drawer.tsx`
- `src/components/auth/AuthShell.tsx`
- `src/components/ui/Input.tsx`
- `src/app/login/page.tsx`
- `src/app/cadastro/page.tsx`
- `src/app/recuperar-acesso/page.tsx`
- `src/components/effects/password-strength/password-strength.css`
- `src/components/effects/page-transition/glob-wipe.css`
- `src/components/layout/PageTransition.tsx`

### Limitações e próximo passo recomendado (ETAPA 5)
1. `prefers-reduced-motion` e leitor de tela reais continuam sem
   teste com ferramenta real (ver acima) — mesma pendência da ETAPA
   4, ainda não fechada.
2. O padrão de bug do sino de notificação (classe-base incondicional
   tipo `inline-flex`/`flex`/`grid` brigando com `hidden` vindo de
   fora via `className`) foi varrido no projeto inteiro nesta sessão
   — não há outra ocorrência hoje — mas vale manter esse cuidado em
   componentes futuros: prefira envolver em um `<div>` externo a
   passar `"hidden md:..."` direto numa classe já usada em
   `IconButton`/`Button`/outros componentes com display fixo na
   base.
3. Revisão humana final de gosto/sensação na transição de página
   (a névoa/faixa atmosférica é uma escolha de direção, não uma
   correção objetiva — vale o proprietário ver ao vivo e pedir
   ajustes de cor/velocidade se quiser).
4. GSAP do Vault via CDN continua sendo decisão intencional já
   registrada (ver seção "Efeitos" da ETAPA 4, mantida abaixo) — não
   mexido nesta sessão.

---

## Estado atual (ETAPA 4 — validação visual real)
Quarta etapa. Diferença fundamental em relação às três anteriores:
desta vez havia um **navegador real disponível no ambiente**
(Chromium headless via Playwright, já instalado em
`/opt/pw-browsers`) — a pendência de mais alta prioridade registrada
no fim da ETAPA 3 ("validação visual real") pôde finalmente ser
executada, não só planejada.

Rodei `npm install`, subi `next dev` e também um build de produção
(`next build` + `next start`), e usei um script Playwright para
navegar por **12 rotas × 2 temas (Light/Dark) × 5 breakpoints**
(1920×1080, 1366×768, ~768px, ~390px, ~360px), capturando screenshot
de página inteira, checando overflow horizontal via
`scrollWidth > clientWidth`, e coletando todo erro/warning de
console e `pageerror`. Isso foi repetido depois de cada correção
para confirmar que o problema sumiu.

**Resultado da auditoria automatizada:** zero overflow horizontal em
qualquer combinação de tema/viewport/rota testada. Dois problemas
reais de hidratação do React foram encontrados (um só aparecia em
build de produção) e corrigidos — ver "O que foi corrigido nesta
sessão" abaixo. Depois das correções, `npm run build`, `npx tsc
--noEmit` e `npx eslint .` terminaram sem erros, e a varredura
Playwright não reportou mais nenhum erro de console em nenhuma
rota/tema/viewport (o único "erro" de rede que aparece — um 403 ao
carregar GSAP de `cdn.jsdelivr.net` no `/cadastro` — é uma restrição
de rede deste sandbox de execução, não um bug do projeto; ver seção
"Efeitos" abaixo).

**Limitação que permanece, honestamente:** o Playwright headless
reproduz fielmente layout, CSS, JS e erros de console, mas não é o
mesmo que um olho humano numa tela física — não substitui uma
passada final do proprietário no próprio navegador, especialmente
para julgar "sensação"/gosto (não bugs objetivos). Também não testei
`prefers-reduced-motion`/leitor de tela real nesta sessão (sem tempo
de contexto restante) — ver "Próximo passo recomendado".

## O que foi corrigido nesta sessão (ETAPA 4)
Dois bugs de hydration mismatch do React, ambos reais e
reproduzíveis, ambos encontrados **somente** graças ao navegador real
(nenhuma leitura de código nas sessões anteriores os havia
identificado):

1. **`ThemeProvider` (`src/lib/theme/theme-provider.tsx`)** — os
   `useState` de `preference`/`systemTheme` usavam inicializadores
   preguiçosos que liam `localStorage`/`matchMedia` diretamente. No
   servidor isso sempre resolvia para `system`/`dark` (não há
   `window`); no cliente, já na primeira renderização de hidratação,
   resolvia para o valor real do usuário. Como `Logo` e
   `ThemeSwitcher` leem esse estado via `useTheme()`, toda página, em
   ambos os temas, disparava um hydration mismatch no console
   (visível também em produção). **Correção:** o estado inicial
   agora é sempre o mesmo valor fixo (`"system"`/`"dark"`) em
   servidor e cliente; o valor real só é lido dentro de um
   `useEffect` de montagem, que sincroniza o estado React com o que
   o script inline (`themeInitScript`) já tinha aplicado ao DOM antes
   da hidratação. Nenhuma lógica de tema, token ou comportamento
   visual mudou — só a ordem/tempo de leitura do valor real.
2. **`DataFreshness` (`src/components/ui/DataFreshness.tsx`)** — o
   texto "Atualizado há X min" era calculado com `Date.now()` já no
   inicializador do `useState`. Como Home, Mapa e Cidade são páginas
   estáticas/SSG (prerenderizadas uma vez no build), o texto
   "congelado" no HTML gerado quase nunca bate com o instante real em
   que o navegador da pessoa hidrata a página — isso só aparecia no
   **build de produção** (`next start`), não em `next dev`, porque em
   dev o servidor renderiza a cada request. Confirmado com Playwright
   contra o build de produção: erro de hydration (`#418`) em `/`,
   `/mapa` e `/cidade/[slug]`. **Correção:** o rótulo relativo agora
   só é calculado dentro de um `useEffect` (depois de montar), com um
   texto neutro ("recentemente") como estado inicial idêntico em
   servidor e cliente. O intervalo de atualização a cada 30s e toda a
   lógica de "dado desatualizado" continuam exatamente iguais.

Ambas as correções seguiram o padrão de comentário já usado nesses
arquivos (explicação em português do porquê) e passaram por
`eslint .` (que inicialmente acusou
`react-hooks/set-state-in-effect` nas duas correções — resolvido com
`eslint-disable-next-line` pontual e comentado, porque o padrão
"sincronizar com uma fonte externa uma única vez na montagem" é
exatamente o caso que essa regra não cobre bem). `git diff --stat`
confirma que só esses dois arquivos foram tocados nesta sessão.

## Validação visual real — o que foi observado (sem problemas)
Por captura de tela real (não leitura de código), confirmado sem
problemas em Light e Dark, nos 5 breakpoints, para: Home, Mapa,
Cidade, Sobre, Fontes, Conta, Preferências, Notificações, Login,
Cadastro, Recuperar acesso, Verificar OTP:
- Nenhum overflow horizontal.
- `MapExplorer`: grid `lg:` empilha corretamente em tablet (768px);
  mapa continua protagonista em todos os tamanhos; painel lateral não
  compete visualmente com o mapa.
- Drawer mobile (360px e 390px): abre corretamente, sem corte, itens
  de navegação e seletor de tema acessíveis.
- Foco de teclado (`Tab`): anel de foco visível e com bom contraste
  testado no Header (bell/tema) e no formulário de Login.
- `PasswordStrengthVault` e `OtpVerificationCard`: a "ilha escura"
  intencional se integra bem ao formulário tanto em Light quanto em
  Dark, nos tamanhos de tela grandes e pequenos — nenhuma mudança
  necessária, confirma o que a ETAPA 3 já tinha registrado por
  leitura de código.
- Efeitos de terceiro testados interativamente: Frost Button (hover)
  e Social Links/Tooltip (hover) renderizam e respondem como
  esperado. Ripple Button não teve o frame exato da animação
  capturado no clique (limitação de timing do screenshot, não
  evidência de problema — o botão responde visualmente ao estado
  `active`).
- `Day/Night Window Toggle` (`/conta/preferencias`): cena Light e
  Dark renderizam corretamente, sem exigir nenhum ajuste.

## Efeitos — nota sobre o GSAP do Vault (não é bug do projeto)
Durante a varredura, `/cadastro` reportou um único erro de rede: 403
ao buscar `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js`.
Investigado: é bloqueio da lista de domínios permitidos **deste
ambiente de execução específico** (sandbox desta sessão), não do
projeto. O próprio `PasswordStrengthVault.tsx` já documenta essa
dependência externa como decisão intencional ("igual ao pacote
original") e já implementa degradação graciosa quando o script não
carrega — confirmado visualmente: o Vault continua renderizando e
utilizável mesmo com o GSAP bloqueado. Não alterado. Fica registrado
para não ser reaberto como dúvida: se uma sessão futura tiver acesso
de rede irrestrito, o comportamento deve ser idêntico ou melhor (com
a animação GSAP funcionando).

## Testes (ETAPA 4)
- `npm install` — ok (ambiente não trazia `node_modules`).
- `npx tsc --noEmit` — sem erros.
- `npx eslint .` — sem erros nem warnings.
- `npm run build` — 17 rotas, sem erros.
- `npm run dev` + `npm run start` (produção) — ambos testados com
  Playwright real; zero erros de console/hydration após as correções.

## Pendência de "validação visual real" — agora fechada
A pendência nº 1 registrada no fim da ETAPA 3 ("abrir o projeto num
navegador de verdade") foi executada nesta sessão com um navegador
Chromium real. Tema claro/escuro e responsividade podem ser
promovidos de "parcial" para **"validado visualmente"** nos 5
breakpoints e 2 temas cobertos pelo master prompt. Ressalva: validação
automatizada (Playwright) não substitui 100% um julgamento humano de
gosto/sensação — só objetivamente bugs (overflow, erro de console,
elemento cortado, contraste). Nada aqui indica a necessidade de
outra rodada de correções visuais além das duas já feitas.

## Arquivos modificados (ETAPA 4)
- `src/lib/theme/theme-provider.tsx` — estado inicial fixo
  (hydration-safe), sincronização real do tema movida para
  `useEffect` de montagem.
- `src/components/ui/DataFreshness.tsx` — rótulo de tempo relativo
  calculado só depois de montar; placeholder neutro como estado
  inicial.

## Próximo passo recomendado (ETAPA 4)
1. Revisão humana final de gosto/sensação (não bugs) — a validação
   automatizada não julga estética, só corretude.
2. Testar `prefers-reduced-motion` e leitor de tela reais (não houve
   tempo de contexto nesta sessão para isso).
3. Se uma sessão futura tiver acesso de rede irrestrito, confirmar
   que o Vault com GSAP carregado de verdade (animação completa,
   não só o estado inicial estático) continua bem integrado.
4. Considerar (fora do escopo desta etapa, é decisão do proprietário)
   vendorizar o GSAP localmente em vez de CDN, já que o projeto já
   tomou essa mesma decisão para fontes (ver README, "Decisão
   registrada") — reduziria dependência de rede externa em produção
   também para usuários reais, não só para este sandbox.

---

# Histórico (ETAPA 4 e anteriores)


## O que foi concluído (sessão anterior)
- **Logo**: presença aumentada em todos os pontos de uso —
  `Header` (36→44px), `Footer` (34→40px), `AuthShell`/Login/Cadastro
  (52→76px) — sem alterar os arquivos de imagem originais nem a regra
  light/dark centralizada em `Logo.tsx`.
- **Transição de página ("Glob Wipe")**: paleta trocada de
  rosa/roxo/ciano (`#ff3cac` / `#8b5cf6` / `#00e5ff`) para tons de água
  e dado científico já existentes no design system
  (`--data-rain-2`, `--data-rain-4`, `--color-accent`). Geometria do
  blob, curva de easing e keyframe `pt-globSweep` **não foram tocados**
  — só a cor mudou, que é o único eixo que o master prompt libera para
  esse efeito específico. Afeta a transição em todas as rotas.
- **Login / Criar conta (`AuthShell`)**: card alargado de `max-w-sm`
  (384px) para `max-w-md` (448px) e padding aumentado (`p-6`→`p-7/p-8`),
  resolvendo o aperto real que existia — o Vault de senha
  (`password-strength.css`) tem `min-width: 320px` e mal cabia dentro do
  card antigo. Adicionado um fundo ambiente sutil e estático (dois glows
  radiais com blur, usando `--data-rain-2` e `--color-accent`,
  opacidade 0.35, sem animação) para dar contexto climático às telas de
  autenticação sem competir com o formulário; respeita
  `prefers-reduced-transparency`. Título convertido para a nova classe
  `.text-heading`.
- **Tipografia**: adicionadas três classes utilitárias em
  `globals.css` — `.text-display`, `.text-heading`, `.text-eyebrow` —
  com tracking/leading específicos por tamanho (negativo e apertado nos
  maiores, neutro/relaxado no menor), usando `clamp()` para escalar sem
  breakpoints extras. Aplicada no H1 da home (`.text-display`) e no
  título do `AuthShell` (`.text-heading`) como prova de conceito.

## O que foi concluído (sessão 2)
- **Tipografia propagada**: `.text-display` aplicada aos H1 de
  `/mapa`, `/cidade/[slug]`, `/sobre`, `/fontes` (substituindo
  `text-2xl/3xl font-semibold` ad-hoc); `.text-heading` aplicada aos
  H1 de `/conta/preferencias` e `/conta/notificacoes` e a todos os H2
  de seção (`page.tsx`, `/sobre`, `/cidade/[slug]`); `.text-eyebrow`
  aplicada aos rótulos pequenos em caixa-alta de `Alert.tsx`
  (`AlertBanner`) e `AIInsight.tsx`, substituindo
  `text-xs font-semibold uppercase tracking-wide` repetido em cada
  lugar. Nenhuma página ficou de fora da lista original.
- **Microinterações do painel principal**: `Card` ganhou uma prop
  `interactive` opcional (hover eleva levemente com `-translate-y-0.5`,
  escurece a borda e sobe para `--shadow-elevation-3`, tudo com os
  tokens de easing/duração já existentes — nada novo foi inventado em
  motion). `RegionCard` usa essa prop; o link "Ver detalhes" ganhou
  uma seta que desliza no hover e feedback de toque
  (`active:gap-1`), seguindo o princípio de resposta imediata ao
  toque. `AlertCard` (lista de alertas ativos) ganhou realce de fundo
  no hover para facilitar a varredura visual da lista, sem virar link
  (não tinha destino — `sourceUrl` ainda é sempre `null` nos dados
  mock, então não inventei navegação nova ali).
- **Microinterações fora do painel**: os botões de camada do
  `MapCard` (nuvens/chuva/vento) e os itens do `ThemeSwitcher` e da
  navegação do `Header` ganharam `active:scale-*` (feedback no toque,
  não só no hover/click) e transições explícitas via
  `--duration-fast`/`--ease-standard`, alinhando-os ao padrão que o
  `Button` já usava. O botão de mostrar/ocultar senha em
  `PasswordField` (Input.tsx) recebeu o mesmo tratamento.
- **Mapa — checagem de paleta**: novo grep confirma que nenhum arquivo
  de `/mapa` ou `components/map/` usa roxo/violeta; item 2 da lista
  anterior fica registrado como "sem problema encontrado", não como
  pendente.
- **Ambiente**: `npm install` rodado neste ambiente (o ZIP não trazia
  `node_modules`); build, `tsc --noEmit` e `eslint .` confirmados
  limpos após todas as mudanças acima.

## O que foi concluído (sessão 3, parte 1)
- **Efeito de Login — pendência fechada**: reli `README.md` (seção
  "Efeitos de terceiro integrados") junto com `app/login/page.tsx`,
  `AuthShell.tsx` e `components/effects/*`. O README já documentava,
  de forma explícita, os 7 efeitos portados e os 2 descartados (com
  justificativa) do pacote `efeitos.zip` — nenhum deles foi destinado
  ao Login. O único efeito que toca a tela de Login é a transição de
  página compartilhada (Glob Wipe) mais o fundo ambiente estático que
  já tinha sido adicionado ao `AuthShell` na sessão anterior. Não
  existe um "efeito de Login" órfão para integrar. Considero esse
  ponto definitivamente resolvido — não é mais necessário perguntar
  ao proprietário sobre isso nas próximas sessões, a menos que ele
  apareça com um pacote de efeitos novo.
- **Microinterações restantes**: `Switch` (hover na trilha + sombra no
  thumb + `active:scale-95`), `Tooltip` (entrada com leve translate +
  opacity em vez de opacity puro), `IconButton` (hover de fundo além
  da borda, `active:scale-90` — refletiu automaticamente em `Drawer` e
  em todo lugar que usa `IconButton`), `Drawer` (fade-in do backdrop).
  Também: nav lateral do `AccountShell`, os pills de unidade de
  temperatura e de região favorita em `/conta/preferencias`, e os
  itens de notificação em `/conta/notificacoes` ganharam
  hover/press consistentes com `--duration-fast`/`--ease-standard`
  (mesmos tokens já usados no resto do app — nenhuma linguagem de
  motion nova).
- **`MapExplorer.tsx` — hierarquia e composição**: painel lateral
  trocou de `div` com borda solta para `Card elevated` (mesma
  linguagem visual dos outros cards do app); título da região ganhou
  eyebrow "Região selecionada" e a lista de abas ganhou eyebrow
  "Selecione uma região para analisar", deixando explícito o que a
  tela está mostrando; legenda de chuva virou uma linha compacta
  (`flex-wrap`) em vez de lista vertical, reduzindo a "sensação de
  formulário"; métricas ganharam separadores sutis (`border-y`) para
  segmentar visualmente o cartão sem introduzir sombras/bordas extras.
  Geometria e paleta do `MapCard`/`RegionIllustration` não foram
  tocadas (só a moldura ganhou `shadow-elevation-2` para alinhar com
  o Card ao lado).
- **Auditoria de cores hardcoded (tema)**: grep completo em `src/`
  (excluindo `components/effects/`, que tem paleta própria por
  design) por hex literais, classes de paleta Tailwind
  (`bg-red-500` etc.) e `rgb()/rgba()` inline — **zero ocorrências**.
  Todo o app usa os tokens semânticos de `globals.css`. Único ponto
  não-semântico encontrado foi um `bg-white opacity-10 dark:opacity-
  [0.06]` em `MapCard.tsx` representando a camada visual de "nuvens"
  — deixado como está porque é uma cor de fenômeno físico (nuvem
  branca), não uma cor de UI/chrome, e já tem ajuste de opacidade por
  tema.
- **Revisão manual (leitura de código) dos componentes do checklist
  do master prompt**: `Header`, `Footer`, `Card`, `Button`, `Input`,
  `Switch`, `Tooltip`, `IconButton`, `Drawer`, `Modal`, `Alert`,
  `AIInsight`, `RegionCard`, `MapCard`, `MapExplorer`, `AccountShell`,
  `StatusBadge`, `WeatherMetric`, `Sparkline`, `DataFreshness`,
  `DataSourceBadge` e as páginas de `/conta*`, `/login`, `/cadastro`,
  `/mapa`, `/sobre`, `/fontes`, `/cidade/[slug]` — todos usam tokens
  consistentemente; nenhum problema de cor hardcoded ou classe
  ad-hoc encontrado além do já registrado acima. **Isto não substitui
  inspeção visual real** (ver limitação no topo do arquivo).

## O que foi concluído (sessão 3, parte 2 — esta continuação)
- **`Input.tsx`/`PasswordField` e `RegionCard.tsx` revisados** por
  completo: ambos já usavam tokens consistentemente e já tinham
  feedback de toque (`active:scale-90` no botão de mostrar senha,
  seta animada + `active:gap-1` no link "Ver detalhes"). Nenhuma
  mudança necessária.
- **Efeitos vs. tema claro — investigado e esclarecido**: `Vault`
  (`password-strength.css`, em `/cadastro`) e `OtpVerificationCard`
  (`otp-verification.css`, em `/verificar-otp`) têm paleta própria
  fixa (fundo escuro tipo "console de instrumento": `--bg: #0d0d10`
  / `--page: #101216` etc.), **escopada só ao próprio widget**
  (`.otp-root { background: var(--page) }`), não ao `<body>` — ou
  seja, é uma ilha escura intencional dentro de um formulário que
  pode estar em tema claro ou escuro do VIGIA. Isso já é uma decisão
  registrada no README ("copiados verbatim... sem alteração de cor")
  e é exatamente o que o master prompt desta etapa pede para
  preservar (efeitos são patrimônio visual, só posição/escala podem
  mudar). Não é um bug de tema — é um comportamento deliberado e
  documentado. Registro aqui formalmente como "auditado e confirmado
  intencional" para não ser reaberto como dúvida em sessões futuras.
- **Consistência de espaçamento entre páginas** (`vigia-container` +
  `py-*`/`gap-*` de cada `page.tsx`): `py-8`/`gap-6` a `gap-12` em
  `/`, `/mapa`, `/cidade/[slug]` (páginas "ferramenta", mais densas)
  vs. `py-10`/`max-w-3xl` em `/sobre`, `/fontes` (páginas de leitura,
  mais respiro) — diferença é proposital pelo tipo de conteúdo, não
  inconsistência a corrigir; todos os valores vêm da mesma escala de
  `--space-*`, nenhum valor mágico novo foi introduzido.

## O que está parcialmente implementado
- **Tema claro/escuro**: a parte estática (grep de cores + leitura de
  cada componente) está feita e limpa. A parte que só um navegador
  revela — contraste percebido, blur/backdrop em cima de fundos reais,
  como sombras "leem" em cada tema — não pôde ser validada nesta
  sessão por falta de ambiente com browser/preview.
- **Responsividade**: revisão de código feita para `Header` (nav
  desktop `hidden md:flex` + `Drawer` mobile, botões extras escondidos
  em `sm`/`md`), `AuthShell`/formulários (`max-w-md`, `px-4 sm:px-6`,
  `PasswordStrengthVault` com `min-width: 320px` cabendo no card),
  `vigia-container` (padding reduzido abaixo de 640px), `MapExplorer`
  (`grid lg:grid-cols-[1.6fr_1fr]`, empilha em telas menores que
  `lg`). Nenhum overflow ou breakpoint óbvio identificado por leitura,
  mas — mesma ressalva — não houve teste manual em viewport real
  (1920/1366/768/390/360) nesta nem em nenhuma sessão anterior.

## O que falta fazer
1. **Validação visual real** (única pendência de alta prioridade
   agora): abrir o projeto num navegador de verdade — Light/Dark,
   1920×1080, 1366×768, ~768px, ~390px, ~360px — e confirmar
   visualmente o que as sessões 3(a) e 3(b) só puderam auditar por
   código (cores hardcoded, tokens, espaçamento, e as ilhas escuras
   intencionais do Vault/OTP descritas acima). Sem isso, "Tema
   claro/escuro" e "Responsividade" continuam como "parcial", não
   "concluído" — não é falta de trabalho de código, é falta de um
   ambiente com navegador nesta sessão.
2. Revisão cruzada de consistência global entre todas as páginas
   (Prioridade 7 do master prompt) foi concluída no nível estrutural
   (tipografia, espaçamento, cards) nesta sessão; o que resta aí
   também depende da mesma validação visual do item 1.

## Arquivos modificados (esta sessão)
- `src/components/ui/Switch.tsx` — hover na trilha, sombra no thumb,
  `active:scale-95`, transições explícitas.
- `src/components/ui/Tooltip.tsx` — entrada com opacity + translate.
- `src/components/ui/IconButton.tsx` — hover de fundo no estado
  inativo, `active:scale-90` com easing explícito.
- `src/components/ui/Drawer.tsx` — fade-in do backdrop
  (`@keyframes drawer-fade-in`).
- `src/components/account/AccountShell.tsx` — nav lateral com
  transição de cor/transform e `active:scale-[0.97]`.
- `src/app/conta/preferencias/page.tsx` — pills de unidade e de
  região favorita com hover/press.
- `src/app/conta/notificacoes/page.tsx` — item de notificação com
  `active:bg-...` além do hover existente.
- `src/components/map/MapExplorer.tsx` — reestruturado: `Card
  elevated` no painel lateral, eyebrows de contexto, legenda em
  linha, separadores nas métricas, sombra na moldura do mapa.

## Problemas conhecidos
- Nenhum erro de build/TypeScript/ESLint no momento da entrega deste
  ZIP (`npm run build`, `npx tsc --noEmit`, `npx eslint .` — todos
  limpos, confirmado ao final desta sessão).
- Este ambiente de execução não tem navegador disponível (sem
  Chromium instalado, sem acesso de rede aos binários de
  Playwright/Puppeteer) — toda a validação visual desta sessão foi
  por leitura de código, não por captura de tela real. Repetido aqui
  de propósito porque é o maior risco residual do projeto neste
  momento.

## Próximo passo recomendado
1. Rodar `npm run dev` num ambiente com navegador (local do
   proprietário, ou uma sessão com preview) e validar visualmente
   Light/Dark + os 5 breakpoints listados no master prompt. Prestar
   atenção especial em: `MapExplorer` (grid `lg:` — checar o ponto de
   quebra em tablet ~768px), `Header`/`Drawer` em 360px, e como os
   efeitos de terceiro (Frost, Ripple, OTP, Password Vault) se
   comportam no tema claro.
2. A partir do que a validação visual encontrar, fazer uma segunda
   passada de ajustes finos (a "Prioridade 1" e "Prioridade 2" do
   master prompt viram itens acionáveis específicos em vez de uma
   auditoria genérica).
3. Revisão cruzada de consistência entre todas as páginas (item 2 de
   "O que falta fazer" acima).

## Observações
- Todos os efeitos de terceiro continuam funcionando e nenhum arquivo
  em `reference/efeitos-selecionados/` ou `components/effects/` foi
  removido ou reescrito estruturalmente nesta sessão.
- Este ambiente não trouxe `node_modules` — rode `npm install` antes
  de `npm run dev`/`build` se for continuar a partir deste ZIP.
