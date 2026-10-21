# Design Reference — Piaro

> Adaptado do design system do **Cifra Club** (https://www.cifraclub.com.br) para o contexto da Piaro: e-commerce de streaming e produtos digitais com assinatura.

- **Site de referência**: Cifra Club — "Seu site de cifras e tablaturas"
- **Arquivos analisados**: página inicial e página de listagem de categoria ("Hinos Avulsos CCB")
- **Data da análise**: 2026-10-20
- **Documento gerado por**: skill `piaro-design-reference`

---

## 1. Conceito Visual

A Piaro adota a estrutura visual do Cifra Club mantendo a fidelidade de construção (grid, espaçamentos, hierarquia, estados de interação) e substituindo apenas a camada semântica:

- **Cifra Club** é um catálogo gratuito de conteúdo musical, denso em informação e leve em conversão.
- **Piaro** é uma loja de assinaturas com conversão transacional: cada card precisa carregar preço, plano e CTA claro.

A adaptação preserva a "sensação" do Cifra Club — escuro, denso, orientado a busca — e injeta os elementos de e-commerce que faltam no original (preço destacado, badge de promoção, CTA direto no card).

### Decisões de adaptação

| Dimensão | Decisão |
|----------|---------|
| Tema | **Dark-only**. A Piaro não terá tema light. Os tokens da Piaro ficam em HSL de 3 canais (aceitando alpha no 4º) no `:root` do `globals.css`; se um tema light for introduzido no futuro, mover os valores para um `[data-theme="light"]` não exige tocar em nenhum componente, apenas no CSS. |
| Densidade | Manter **alta** — listagem densa, cards pequenos, muitas categorias visíveis |
| Cor de ação | Manter o **âmbar/marrom** `#b77d36` do Cifra Club como accent principal |
| Grid | Manter o grid de 12 colunas com gutter de 24px (`--gutter: 24px`) |
| Cards | Adaptar o card de cifra para card de plano de streaming (imagem + nome + preço + CTA) |
| Header | Manter header fixo com busca centralizada. Altura elevada de `56px` para `64px` — **decisão da Piaro**, não extração: o layout tem dois CTAs à direita (`Entrar` + `Criar conta`) que não cabem no original. Ver [5.1](#51-header). |
| Camada de tema no frontend | `globals.css` foi convertido da paleta shadcn/ui legada (azul/bootstrap) para a paleta do Cifra Club no formato `hsl(var(--x))`. As variáveis que o shadcn já esperava (`background`, `primary`, `destructive`, etc.) foram **preservadas** com novos valores; tokens específicos da Piaro (`surface`, `border-subtle`, `text-muted`, categorias, estados) foram **acrescentados** por cima. Componentes shadcn futuros funcionam sem adaptação. |

---

## 2. Sistema de Cores

### 2.1 Cores base extraídas do Cifra Club

Extraídas dos tokens CSS do arquivo `310ee7f887944da9.css` e `c1477c827a025de3.css`.

#### Tema escuro (padrão na Piaro)

| Token Cifra Club | Hex | Piaro | Uso |
|---|---|---|---|
| `--base-neutral-background-dynamic-0` | `#000000` | `--piaro-background` | Background base da aplicação |
| `--base-neutral-background-dynamic-10` | `#1b1b1b` | `--piaro-surface` | Background de cards, header, sidebar |
| `--base-neutral-background-dynamic-15` | `#262626` | `--piaro-surface-raised` | Background de elementos sobre cards (inputs, chips) |
| `--base-neutral-background-dynamic-20` | `#303030` | `--piaro-surface-overlay` | Background de modais, dropdowns |
| `--base-neutral-background-dynamic-30` | `#474747` | `--piaro-border-strong` | Bordas de inputs e separadores fortes |
| `--base-neutral-background-dynamic-40` | `#5e5e5e` | `--piaro-border-focus` | Foco de teclado |
| `--base-neutral-background-dynamic-50` | `#777777` | `--piaro-text-muted` | Texto secundário |
| `--base-neutral-foreground-dynamic-10` | `#f1f1f1` | `--piaro-foreground` | Texto principal |
| `--base-neutral-foreground-dynamic-40` | `#ababab` | `--piaro-foreground-secondary` | Texto secundário claro |
| `--near-black` | `#181818` | `--piaro-header` | Header background |
| `--device` | `#141414` | `--piaro-footer` | Footer background |
| `--on-photo` | `#ffffff` | `--piaro-on-media` | Texto sobre imagem/vídeo |

#### Cor de ação

| Token | Hex RGB | Piaro | Uso |
|---|---|---|---|
| `--action` | `#b77d36` / `183 125 54` | `--piaro-primary` | Botões primários, links de ação, preço em destaque |
| `--action` hover | `rgba(183,125,54,0.35)` | `--piaro-primary-hover-alpha` | Estados de hover em botões com fundo transparente |

> **Tema light:** não implementado (Piaro é dark-only). Referência para futuro:
> `#ffffff` background · `#1b1b1b` foreground · `#f1f1f1` surface ·
> `#e2e2e2` surface-raised · `#c6c6c6` border · `#ababab` text-muted.
>
> Se um tema light for introduzido, basta criar um seletor `[data-theme="light"]`
> no `globals.css` com esses valores — nenhum componente precisa mudar.

#### Cores semânticas adicionadas (ausentes no Cifra Club)

O Cifra Club não possui cores semânticas de estado explícitas. Para o contexto de e-commerce da Piaro, adicionamos:

| Token | Valor | Uso |
|---|---|---|
| `--piaro-success` | `#22c55e` | Assinatura ativa, pagamento confirmado |
| `--piaro-warning` | `#f59e0b` | Assinatura expirando, aviso |
| `--piaro-danger` | `#ef4444` | Assinatura cancelada, erro |
| `--piaro-info` | `#3b82f6` | Mensagens informativas |
| `--piaro-discount` | `#22c55e` | Badge de desconto (herda o verde de sucesso) |

### 2.2 Escala de alphas

Overlays claros sobre superfície escura, extraídos de `--base-neutral-background-dynamicAlpha-*`:

| Alpha | Valor | Token |
|---|---|---|
| 0% | `hsl(0 0% 100% / 0)` | `--piaro-transparent` |
| 4% | `hsl(0 0% 100% / 0.04)` | `--piaro-overlay-04` |
| 8% | `hsl(0 0% 100% / 0.08)` | `--piaro-overlay-08` |
| 12% | `hsl(0 0% 100% / 0.12)` | `--piaro-overlay-12` |

### 2.3 Categorias de streaming (adaptação criativa)

O Cifra Club usa cor como codificador do identificador de **tonalidade musical** (lá, ré, mi…). Para a Piaro, reutilizamos a mesma técnica para **categoria de streaming**, mantendo o padrão "cor = identidade do item" que o Cifra Club já estabeleceu:

| Categoria | Cor | Token |
|---|---|---|
| Streaming de Vídeo (Netflix, Prime, Disney+) | `#b77d36` (amber) | `--piaro-cat-video` |
| Streaming de Música (Spotify, Deezer, Apple Music) | `#22c55e` (green) | `--piaro-cat-music` |
| Streaming de Animes (Crunchyroll, Netflix) | `#a855f7` (purple) | `--piaro-cat-anime` |
| Streaming de Esportes (Globoplay, Premiere) | `#ef4444` (red) | `--piaro-cat-sports` |
| VPN e Segurança | `#3b82f6` (blue) | `--piaro-cat-vpn` |
| Cloud Storage | `#06b6d4` (cyan) | `--piaro-cat-cloud` |
| Software e Apps | `#f59e0b` (yellow) | `--piaro-cat-software` |

---

## 3. Tipografia

Extraída de `font-family` no CSS do Cifra Club.

| Papel Cifra Club | Fonte | `piaroFonts` | Classe Tailwind | Uso |
|---|---|---|---|---|
| Display principal | **Lexend Deca** | `display` | `font-display` | Títulos de página (h1, h2), headlines do hero |
| Display condensado | **Ourissanga Condensed** | `condensed` | `font-condensed` | Subtítulos, tags, badges, números grandes |
| Body | **Roboto** | `body` | `font-body` | Texto corrido, descrições, labels de formulário |
| Mono | **Roboto Mono** | `mono` | `font-mono` | Credenciais, códigos, hashes, slugs |

⚠️ **Lexend Deca** e **Ourissanga Condensed** são proprietárias da Studio Sol e
exigem licença para uso comercial. `piaroFonts` já inclui fallbacks livres
(Nunito Sans / Manrope e Oswald / Barlow Condensed) para desenvolvimento.

### 3.1 Escala tipográfica (adaptada do sistema do Cifra Club)

O Cifra Club usa um sistema de "data-size" com sufixos semânticos:
`bodyFixedNormalBase`, `bodyFixedModerateBase`, `bodyFixedStrongestBase`, `labelDynamicNormalBase`, `titleDynamicUpStrongBase`, `displayDynamicUpStrongBase`, etc.

Tradução para escala Tailwind:

| Token Cifra Club | Tamanho | Tailwind | Peso |
|---|---|---|---|
| `displayDynamicUpStrongLarge` | `3.5rem` (56px) | `text-5xl` | 700 |
| `displayDynamicUpStrongBase` | `2.5rem` (40px) | `text-4xl` | 700 |
| `titleDynamicUpStrongBase` | `1.75rem` (28px) | `text-2xl` | 600 |
| `titleDynamicUpStrongSmall` | `1.4rem` (22px) | `text-xl` | 600 |
| `bodyFixedStrongestBase` | `1.125rem` (18px) | `text-lg` | 500 |
| `bodyFixedNormalBase` | `1rem` (16px) | `text-base` | 400 |
| `bodyFixedNormalSmall` | `0.875rem` (14px) | `text-sm` | 400 |
| `captionFixedNormalBase` | `0.75rem` (12px) | `text-xs` | 400 |
| `labelFixedNormalBase` | `0.8125rem` (13px) | `text-[13px]` | 500 |
| `contentMonoFixedNormalBase` | `0.875rem` (14px) | `font-mono text-sm` | 400 |

**Nota:** `labelFixedNormalBase` (13px) não tem classe Tailwind padrão — `text-xs` é 12px. O tamanho está exposto como `piaroFontSizesCustom.label` em `packages/design-tokens/src/typography.ts` e deve ser aplicado via classe arbitrária `text-[13px]` ou um plugin que registre a escala.

---

## 4. Espaçamentos e Layout

### 4.1 Border radius

Duas escalas distintas no Cifra Club — **não misturar**.

**Escala genérica** (tokens `--r-*`) — containers, cards, inputs:

| Valor | `piaroRadius` | Classe Tailwind | Uso |
|---|---|---|---|
| `0px` | `none` | `rounded-none` | — |
| `4px` | `xs` | `rounded-xs` | Chips pequenos, badges (`--r-xs`) |
| `8px` | `sm` | `rounded-sm` | Inputs médios, tags (`--r-sm`) |
| `12px` | `md` | `rounded-md` | Cards pequenos (interpolado, sem token) |
| `16px` | `lg` | `rounded-lg` | Cards de plano, modais (`--r-lg`) |
| `20px` | `2xl` | `rounded-2xl` | Hero cards |
| `24px` | `xl` | `rounded-xl` | Sheets, bottom bars (`--r-xl`) |
| `999px` | `full` | `rounded-full` | Pills, avatares (`--r-pill`) |

**Escala de botões** (tokens `--btn-*-r`) — ver [4.2](#42-botões):

| Tamanho | Raio | Classe `btn-*` |
|---|---|---|
| `xSmall` | `6px` | `rounded-btn-xsm` |
| `sm` | `10px` | `rounded-btn-sm` |
| `md` | `12px` | `rounded-btn-md` |
| `lg` | `16px` | `rounded-btn-lg` |

Estas classes são declaradas em `tailwind.config.js` na seção `borderRadius`
(prefixo `btn-`). **Não use** as classes `rounded-sm/md/lg` para botões — são
valores da escala genérica (8/12/16px), que coincidem com `sm/md/lg` dos
botões mas divergem em `xSmall` (6px vs 4px). Para evitar ambiguidade,
use sempre `rounded-btn-*`.

A variável CSS `--radius` (10px) é o anchor interno do shadcn/ui e coincide
com o raio do botão `sm` (`--btn-sm-r`). Não use `--radius` como referência de
escala — `piaroRadius` e `piaroButtonRadius` são as fontes canônicas.

### 4.2 Botões

O Cifra Club dimensiona botões por **altura fixa + raio**, não por padding
vertical (`.hC0CP`). Os tokens `--btn-*-h` e `--btn-*-r` são a fonte.

| Tamanho | Altura | Raio | Padding radial | `piaroButtonHeight` | `piaroButtonRadius` | `piaroButtonPadding` |
|---|---|---|---|---|---|---|
| `xSmall` | `24px` | `6px` | `2px` | `xSmall` | `xSmall` | `xSmall` |
| `sm` | `32px` | `10px` | `6px − borda` | `sm` | `sm` | `sm` |
| `md` | `40px` | `12px` | `10px − borda` | `md` | `md` | `md` |
| `lg` | `48px` | `16px` | `12px − borda` | `lg` | `lg` | `lg` |
| `xl` | `56px` | — | `14px − borda` | `xl` | — | `xl` |

O `lg` é `clamp(40px, 4.6vh, 48px)` no original — a Piaro fixa em `48px` para
evitar reflow em viewports baixas.

**Padding vertical é zero.** O padding horizontal é radial e serve só para
centralizar o conteúdo dentro da altura fixa. Para botão de texto:

```
height: 40px;  padding: 0 8px;  display: inline-flex;
align-items: center;  justify-content: center;
```

Padding vertical só entra em **botões full-width** (ex.: `Assinar` num card de
plano), onde a altura é controlada pelo container.

**`data-size` vs. token:** o CSS original usa `data-size=xSmall|small|medium|large`
no elemento. Os tokens JSX usam nomes mais claros (`xSmall|sm|md|lg|xl`) —
mantenha o mapeamento ao gerar o componente.

#### ⚠️ Nota sobre `padding: 23px 24px`

O valor `23px 24px` aparece no CSS original, mas **não é padding de botão**.
Investigação em `310ee7f887944da9.css` e `7b830605ce22c568.css`:

| Classe | Contexto | Padding original |
|---|---|---|
| `.h0BaY` | Barra fixa inferior (consentimento) | `23px 24px 24px` |
| `.PYz3d` | Banner/promo de marca (Black Friday) | `23px 11px 11px` |

É padding **top** de containers promocionais. Não use como padding de botão.
Exposto como `piaroSpacingBannerTop` em `spacing.ts` caso a Piaro crie bottom bar
ou banner promo próprio.

### 4.3 Grid e breakpoints

Extraído de `@media` no CSS. O grid é de **12 colunas** (`--cols: 12`) com
gutter de **24px** (`--gutter: 24px`).

| Breakpoint | Largura | Colunas habituais |
|---|---|---|
| Mobile | `< 700px` | 2 colunas de cards |
| Tablet | `≥ 700px` | 4 colunas de cards |
| Desktop small | `≥ 975px` | 6 colunas de cards |
| Desktop | `≥ 1200px` | 6 colunas, header expandido |

Container: `--content-max: 1416px` (não 1280px), com margem lateral
`--margin: 16px` (mobile) / `24px` (≥768px). Tokens: `piaroGrid`,
`piaroContainer`.

### 4.4 Mapeamento de tokens hex → variáveis CSS (HSL de 4 canais)

O `apps/web/src/app/globals.css` foi convertido da paleta shadcn/ui (azul/bootstrap) para a paleta do Cifra Club no **formato shadcn de 3 canais**: `hsl(<h> <s>% <l>%)`, em que o alpha é opcional no 4º canal (`hsl(var(--primary) / 0.35)`). Hex viram HSL via qualquer ferramenta padrão (RGB → HSL). A constante é: **`<background-hex>` nunca é colocado direto no CSS — sempre como três números HSL separados por espaço, sem vírgulas, para suportar alpha**.

A tabela abaixo reflete os **valores calculados** pelo conversor em `packages/design-tokens/src/colors.ts` (rodável via `node --input-type=module -e "..."`).

| Piaro (documentado) | Hex | Variável CSS | HSL | Uso |
|---|---|---|---|---|
| `--piaro-background` | `#000000` | `--background` | `0 0% 0%` | `bg-background` |
| `--piaro-surface` | `#1b1b1b` | `--card` | `0 0% 11%` | `bg-card` (cores de planos) |
| `--piaro-surface-raised` | `#262626` | `--secondary`, `--muted` | `0 0% 15%` | `bg-muted` |
| `--piaro-surface-overlay` | `#303030` | `--accent` | `0 0% 19%` | modais, dropdowns |
| `--piaro-header` | `#181818` | (piaro-specific) | `0 0% 9%` | `--header` |
| `--piaro-footer` | `#141414` | (piaro-specific) | `0 0% 8%` | `--footer` |
| `--piaro-border-subtle` | `#1b1b1b` | `--border` | `0 0% 11%` | `border-border` |
| `--piaro-border-strong` | `#474747` | `--input` | `0 0% 28%` | inputs |
| `--piaro-border-focus` | `#5e5e5e` | (piaro-specific) | `0 0% 37%` | `--border-focus` |
| `--piaro-foreground` | `#f1f1f1` | `--foreground` | `0 0% 95%` | `text-foreground` |
| `--piaro-foreground-secondary` | `#ababab` | (piaro-specific) | `0 0% 67%` | `--foreground-secondary` |
| `--piaro-text-muted` | `#777777` | `--muted-foreground` | `0 0% 47%` | `text-muted-foreground` |
| `--piaro-on-media` | `#ffffff` | (piaro-specific) | `0 0% 100%` | texto sobre imagem/vídeo |
| `--piaro-primary` | `#b77d36` | `--primary`, `--ring` | `33 54% 46%` | `bg-primary` |
| `--piaro-primary-foreground` | `#181818` | `--primary-foreground` | `0 0% 9%` | `text-primary-foreground` |
| `--piaro-primary-hover` | `#c78b3f` | (piaro-specific) | `34 55% 51%` | `--primary-hover` |
| `--piaro-primary-hover-alpha` | `rgba(183,125,54,0.35)` | (piaro-specific) | `33 54% 46% / 0.35` | `--primary-hover-alpha` (4 canais) |
| `--piaro-danger` | `#ef4444` | `--destructive` | `0 84% 60%` | `bg-destructive` |
| `--piaro-success` | `#22c55e` | (piaro-specific) | `142 71% 45%` | `--success` |
| `--piaro-warning` | `#f59e0b` | (piaro-specific) | `38 92% 50%` | `--warning` |
| `--piaro-info` | `#3b82f6` | (piaro-specific) | `217 91% 60%` | `--info` |
| `--piaro-discount` | `#22c55e` | (piaro-specific) | `142 71% 45%` | `--discount` (alias de `--success`) |
| `--piaro-cat-video` | `#b77d36` | (piaro-specific) | `33 54% 46%` | `--cat-video` |
| `--piaro-cat-music` | `#22c55e` | (piaro-specific) | `142 71% 45%` | `--cat-music` |
| `--piaro-cat-anime` | `#a855f7` | (piaro-specific) | `271 91% 65%` | `--cat-anime` |
| `--piaro-cat-sports` | `#ef4444` | (piaro-specific) | `0 84% 60%` | `--cat-sports` |
| `--piaro-cat-vpn` | `#3b82f6` | (piaro-specific) | `217 91% 60%` | `--cat-vpn` |
| `--piaro-cat-cloud` | `#06b6d4` | (piaro-specific) | `189 94% 43%` | `--cat-cloud` |
| `--piaro-cat-software` | `#f59e0b` | (piaro-specific) | `38 92% 50%` | `--cat-software` |

A tabela mapeia **conceitos Piaro → variáveis CSS**. Cada variável CSS ainda usa um dos dois grupos:

- **shadcn-preservados** (`--background`, `--card`, `--muted`, `--border`, `--primary`, etc.) — substituídos no `:root`, mantendo o nome que o shadcn já esperava. Componentes shadcn funcionam sem alteração.
- **piaro-específicos** (`--header`, `--footer`, `--success`, `--warning`, `--cat-*`, etc.) — novos, referenciados via `bg-cat-video` após declarado no `tailwind.config.js`.

Tokens neutros (`0 0% N%`) usam o formato nativo do shadcn — três valores sem vírgulas, usado direto em `hsl(var(--background))` ou com alpha em `hsl(var(--background) / 0.04)`.

---

## 5. Componentes Adaptados

### 5.1 Header

**Cifra Club** → header fixo com logo à esquerda, busca centralizada com atalhos por instrumento, menu à direita (nav dropdown + botão de login).

**Piaro** → mesmo layout, semântica de streaming:

```
[Logo Piaro]  [🔍 Buscar plano, serviço ou categoria...]  [Categorias ▾]  [Entrar] [Criar conta]
```

- Altura: **64px** — decisão da Piaro, não extração. O Cifra Club usa
  `--headerHeight: 56px`; aumentamos 8px para acomodar `[Entrar]` + `[Criar conta]`
  lado a lado sem comprimir a busca centralizada. Token: `piaroChrome.header`.
- Largura mínima do conteúdo: **~680px** — soma estimada de logo (~120px) +
  busca (~200px) + dropdown Categorias (~110px) + Entrar (~70px) + Criar conta
  (~100px) + 5 gaps de 16px (~80px).
  - Acima de `sm` (700px): cabe, com ~20px de folga.
  - **Abaixo de `sm`: colapsar `[Criar conta]`** em um menu de usuário (ícone de
    avatar ou hamburger). Não coube o layout completo.
- Background: `--piaro-header` (`#181818`)
- Sticky no scroll, com sombra suave ao rolar
- Busca com placeholder "Buscar streaming, VPN, cloud..."
- O valor de 64px não foi validado visualmente — é estimativa derivada do
  conteúdo mínimo. Revisar ao implementar o primeiro header.

### 5.2 Card de Plano (adaptado do card de Cifra Club)

**Cifra Club** mostra: capa do álbum, título da música, artista, tom (badge colorido).

**Piaro** mostra:

```
┌─────────────────────────────────┐
│ [imagem do serviço 16:9]        │
│ ┌─────────┐                     │
│ │Destaque │  ← badge verde      │
│ └─────────┘                     │
├─────────────────────────────────┤
│ Spotify Premium                 │  ← font-display, text-lg
│ Música · Individual             │  ← text-sm, muted
│                                 │
│ R$ 21,90 /mês                   │  ← font-display, primary, text-xl
│ ~~R$ 34,90~~ 36% off            │  ← riscado, muted
│                                 │
[ Assinar agora ]               ← size="lg" variant="primary", full-width
└─────────────────────────────────┘
```

- Border radius: `rounded-lg` (16px, `piaroRadius.lg`)
- Background: `--piaro-surface` (`#1b1b1b`)
- Hover: border vira `--primary`, `translateY(-2px)`
- Badge "Destaque": `--success`, `rounded-full`
- Badge de desconto: `--discount` (verde, mesmo valor de `--success`), `rounded-full`

### 5.3 Hero Section

**Cifra Club** → banner de campanha com mensagem e CTA.

**Piaro** → hero com proposta de valor + busca:

```
┌─────────────────────────────────────────────────────────┐
│  ASSINE STREAMING SEM ESPERAR                              │
│  Netflix, Spotify, Prime Video e mais.                      │
│  Credenciais entregues em até 30 segundos.                  │
│                                                          │
│  [ Assinar agora ]  [ Ver planos ]                         │
└─────────────────────────────────────────────────────────┘
```

- Background: gradiente de `--piaro-background` para `--piaro-surface-raised`
- Borda inferior: 1px `hsl(0 0% 100% / 0.12)` (overlay 12%)
- Padding: `60px 16px` (mobile), `80px 24px` (desktop)

### 5.4 Grade de Categorias

**Cifra Club** → grade horizontal de chips de tonalidade/instrumento.

**Piaro** → chips de categoria com cor semântica:

```
[🎬 Vídeo]  [🎵 Música]  [📺 Animes]  [⚽ Esportes]  [🔐 VPN]  [☁️ Cloud]
```

- Background do chip: `color-mix(in srgb, var(--cat-color) 15%, transparent)`
- Border: 1px `color-mix(in srgb, var(--cat-color) 40%, transparent)`
- Border radius: `rounded-full` (`piaroRadius.full`)

**Fallback para navegadores sem `color-mix()`** (Safari <16.2, Chrome <111).
A técnica é declarar a versão simples primeiro e a `color-mix()` em seguida:
navegadores antigos usam a primeira, modernos ignoram a primeira e usam a segunda.

```css
.cat-chip {
  /* Fallback: cor de categoria à 15% de opacidade sobre o fundo escuro.
     Equivalente visual de color-mix(in srgb, var(--cat-color) 15%, transparent). */
  background: rgb(var(--cat-color-rgb) / 0.15);
  background: color-mix(in srgb, var(--cat-color) 15%, transparent);

  border: 1px solid rgb(var(--cat-color-rgb) / 0.4);
  border-color: color-mix(in srgb, var(--cat-color) 40%, transparent);
}
```

Isso exige as variáveis auxiliares em RGB — `--cat-video-rgb: 183 125 54`, e
assim por diante — adicionadas ao `globals.css` junto dos tokens HSL existentes:

```css
:root {
  --cat-video-rgb: 183 125 54;
  --cat-music-rgb: 34 197 94;
  --cat-anime-rgb: 168 85 247;
  --cat-sports-rgb: 239 68 68;
  --cat-vpn-rgb: 59 130 246;
  --cat-cloud-rgb: 6 182 212;
  --cat-software-rgb: 245 158 11;
}
```

O formato de três canais RGB com barra slash (`R G B / A`) tem suporte desde
Safari 12.1 e Chrome 65, então cobre qualquer navegador que também não tenha
`color-mix()`.

> Alternativa sem variável auxiliar: usar `opacity` + pseudo-elemento.
> Mais código e mais seletores, útil apenas se precisar de opacidade animada.

### 5.5 Card de Assinatura Atual (dashboard)

Componente **novo** (não existe no Cifra Club, que não tem área de conta do cliente):

```
┌──────────────────────────────────────────┐
│ Netflix Premium          [ATIVA ✓]       │
│ Renovação em 12 dias                    │
│ R$ 39,90 /mês                            │
│ [Ver credenciais]  [Cancelar]           │
└──────────────────────────────────────────┘
```

### 5.6 Card de Credencial (dashboard)

Componente **novo**:

```
┌──────────────────────────────────────────┐
│ Credencial ativa                        │
│ ─────────────────────────────────────────│
│ Usuário  joao@email.com                  │  ← font-mono
│ Senha    xxxx••••••••                     │  ← font-mono, botão revelar
│ [ Copiar ]  [ Revelar ]                   │
└──────────────────────────────────────────┘
```

### 5.7 Botões

Dimensões por **tamanho** ([4.2](#42-botões)) × **variante** (cor). São eixos
independentes: `size="md" variant="brand-filled"`.

**Variantes extraídas do CSS** (`.hC0CP[data-variant=...]`) — o original tem 12;
a Piaro usa 4:

| Variante Piaro | Original | Background | Texto |
|---|---|---|---|
| **primary** | `brand-filled` | `--action` (`#b77d36`) | `--near-black` (`#181818`) |
| **secondary** | `neutral-tonal` | `--state-neutral-common-fixedAlpha-hovered` | `--foreground` |
| **outline** | `neutral-outline` | transparente | 1px `--state-neutral-border-dynamicAlpha-0-8` |
| **ghost** | `neutral-clear` | transparente | `--foreground` |

**Variantes do original não mapeadas** (disponíveis se a Piaro precisar):
`brand-outline`, `assistant-filled`, `red-filled`, `neutral-filled`,
`neutral-outlineFloating`, `neutralReverse-*` (6 variantes para fundo claro).

**Tamanhos:** `xSmall` (24px) · `sm` (32px) · `md` (40px) · `lg` (48px) · `xl` (56px).
Raios: `6 / 10 / 12 / 16px`.

**Como o site expressa hierarquia:** por **cor**, não por tamanho. O `Entrar` do
header é o único botão preenchido do site; os botões de card (`Aprender a tocar`)
são `outline`. Ambos usam o mesmo tamanho. Na Piaro, o CTA é uma **variante de
cor** — um botão `lg variant="primary"` compete com um `lg variant="outline"`
apenas pela cor de fundo.

**Nota:** a Piaro introduz **preço** no card de plano, o que o Cifra Club não
tem. Nesse contexto o card usa `size="lg" variant="primary"` full-width
(`h-12 w-full`), enquanto o header mantém `size="md" variant="primary"`. Isso é
contexto de e-commerce, não extração — documente como decisão da Piaro.

### 5.8 Footer

O Cifra Club tem um footer extenso com 4 colunas de links, botões sociais e badges de apps. A Piaro mantém a estrutura mas reduz para 3 colunas:

```
[Logo + slogan]     [Categorias]      [Minha conta]     [Ajuda]
                    Vídeo              Assinaturas        Central de ajuda
                    Música             Credenciais        Termos de uso
                    Animes             Perfil             Privacidade (LGPD)
                    Esportes           Sair
```

---

## 6. Mapeamento Cifra Club → Piaro

| Elemento Cifra Club | Equivalente Piaro |
|---|---|
| Música | Serviço de streaming |
| Cifra | Plano de assinatura |
| Artista / Banda | Provedor do serviço |
| Álbum | Categoria de streaming |
| Tom / Tonalidade | Categoria (usando cor como codificador) |
| Instrumento | Tipo de serviço (vídeo, música, anime…) |
| Vídeo-aula | Tutorial de configuração da credencial |
| Engraçado / Quero aprender | Recomendados / Mais vendidos |
| Minhas cifras | Minhas assinaturas |
| Slug da cifra | Slug do plano |

---

## 7. Páginas Adaptadas

| Página Piaro | Referência Cifra Club | Adaptação |
|---|---|---|
| `/` Home | Homepage Cifra Club | Hero + categorias + grid de planos em destaque |
| `/planos` | Listagem de cifras | Grid denso + filtros laterais |
| `/planos/[slug]` | Página da cifra | Detalhes do plano + tabela de planos + FAQ |
| `/categorias/[slug]` | Página de listagem ("Hinos Avulsos CCB") | Hero de categoria + grid de planos da categoria |
| `/login` | Modal de login Cifra Club | Página dedicada (diferente do original, que usa modal) |
| `/checkout` | — (não existe no Cifra Club) | **Novo**: revisar pedido + PIX + confirmação |
| `/dashboard/assinaturas` | — (não existe no Cifra Club) | **Novo**: lista de assinaturas ativas |
| `/dashboard/credenciais` | — (não existe no Cifra Club) | **Novo**: lista de credenciais |

---

## 8. Arquivos Gerados

```
packages/design-tokens/
├── src/
│   ├── colors.ts       # Tokens de cor (dark-only) + conversor hex→HSL
│   ├── typography.ts   # Fontes e escala tipográfica
│   ├── spacing.ts      # Espaçamentos, radii, breakpoints
│   └── index.ts        # Exporta tudo
├── package.json
└── README.md
```

---

## 9. Como Usar

### 9.1 Instalação

```bash
pnpm add @piaro/design-tokens --filter web
```

### 9.2 No Tailwind config

Os tokens já estão declarados em `apps/web/tailwind.config.js` usando os nomes
nativos do shadcn/ui e os tokens específicos da Piaro. Não é preciso importar
`@piaro/design-tokens` no config — as variáveis CSS do `globals.css` são a
fonte de verdade, e o Tailwind apenas as expõe como utilitários.

Para consultar ou reaproveitar os tokens em outro contexto:

```ts
import { piaroColors, piaroFonts, piaroRadius, piaroBreakpoints } from '@piaro/design-tokens';
```

Nomes das classes geradas pelo `tailwind.config.js` atual:

| Conceito | Classe Tailwind | Origem |
|---|---|---|
| Background base | `bg-background` | `--background` |
| Superfície (cards) | `bg-card` | `--card` |
| Texto principal | `text-foreground` | `--foreground` |
| Texto secundário | `text-muted-foreground` | `--muted-foreground` |
| Ação | `bg-primary` / `text-primary-foreground` | `--primary` |
| Erro | `bg-destructive` | `--destructive` |
| Borda padrão | `border-border` | `--border` |
| Header / Footer | `bg-header` / `bg-footer` | `--header` / `--footer` |
| Estados | `text-success`, `bg-warning`, `text-danger`, `text-info` | idem |
| Categorias | `bg-cat-video`, `bg-cat-music`, `bg-cat-anime`, `bg-cat-sports`, `bg-cat-vpn`, `bg-cat-cloud`, `bg-cat-software` | `--cat-*` |

Raios e espaçamentos usam a escala padrão do Tailwind mapeada para os valores
da Piaro. **Atenção:** a escala de raios mudou — ver [4.1](#41-border-radius).
Os tokens atuais são `4 / 8 / 12 / 16 / 20 / 24 / 999px`:

`rounded-xs` (4px), `rounded-sm` (8px), `rounded-md` (12px), `rounded-lg` (16px),
`rounded-xl` (24px), `rounded-2xl` (20px), `rounded-full` (999px).

A escala de **botões** é separada e não mapeia para estas classes — use
`piaroButtonRadius` ou `rounded-md` (10px) / `rounded-lg` (12px) conforme o
tamanho. Ver [4.2](#42-botões).

Breakpoints: `sm` 700px, `md` 975px, `lg` 1200px. Container máximo: `1416px`
(`--content-max`).

### 9.3 Em componentes

```tsx
import { Card, CardContent } from '@piaro/ui';

export function PlanCard({ plan }) {
  return (
    <Card className="bg-card rounded-lg border-border hover:border-primary transition-all hover:-translate-y-0.5">
      <CardContent className="p-6">
        <h3 className="font-display text-lg text-foreground">{plan.nome}</h3>
        <p className="text-sm text-muted-foreground">{plan.categoria}</p>
        <p className="font-display text-xl text-primary mt-4">
          {formatBRL(plan.preco)}
        </p>
      </CardContent>
    </Card>
  );
}
```

Nota: o `rounded-lg` do card é **16px** (escala genérica, `piaroRadius.lg`) — ver [4.1](#41-border-radius). O CTA do card é um botão e usa a escala de botões: `h-12` (altura `lg`) com `rounded-btn-lg` (raio `16px`). **Não use `rounded-lg` genérico em botão** — use sempre o prefixo `btn-`.

---

## 10. Checklist de Fidelidade

- [x] Paleta de cor extraída do CSS do Cifra Club (`#b77d36` como action)
- [x] Fontes extraídas (Lexend Deca, Roboto, Roboto Mono, Ourissanga Condensed)
- [x] Escala de border radius extraída em **duas escalas** (genérica `--r-*` + botões `--btn-*-r`)
- [x] Sistema de botões extraído por **altura fixa + raio** (não padding vertical)
- [x] Chrome extraído (`--headerHeight: 56px`, `--bottomNavHeight: 64px`, `--stripHeight: 26px`)
- [x] Grid extraído (`--cols: 12`, `--gutter: 24px`, `--content-max: 1416px`)
- [x] Breakpoints extraídos (700px, 975px, 1200px)
- [x] Estrutura de header replicada
- [x] Estrutura de card de catálogo replicada com semântica Piaro
- [x] Grade de categorias replicada usando cor como codificador
- [x] Footer reduzido e adaptado
- [x] Cores semânticas adicionadas (ausentes no original)
- [x] Componentes novos para dashboard (assinaturas, credenciais)
- [x] Tokens exportados como código TypeScript
- [x] Documentação de uso completa
- [x] Tema decidido como **dark-only** (2026-10-20)
- [x] Tokens hex convertidos para HSL de 3 canais (formato shadcn, alpha opcional no 4º)
- [x] `globals.css` reescrito com paleta do Cifra Club no formato `hsl(var(--x))`
- [x] Variáveis shadcn preservadas (`background`, `primary`, `destructive`, `card`, `muted`, etc.)
- [x] Documento movido de `docs/` para `docs/REFERENCIAS/01-DESIGN-REFERENCE.md`

---

## 11. Limitações e Próximos Passos

### Limitações

1. O CSS do Cifra Club usa classes minificadas (`.OPQf`, `.5QAC`) — a extração de tokens se baseou em `--*` e valores literais, não no mapeamento completo classe→estilo.
2. As duas páginas HTML são pré-renderizadas pelo Next.js; parte do styling vem de CSS files separados que não foram integralmente analisados.
3. Fontes proprietárias (Lexend Deca, Ourissanga Condensed) exigem licença para uso comercial.
4. Tema dark-only: se um tema light for introduzido no futuro, todos os valores HSL estão em um só `:root`. Mover para um `[data-theme="light"]` exige **só** alterar o CSS, não componentes. O custo retroativo de adicionar light é ~30 linhas de CSS e o teste de contraste AA em alguns pares.

### Próximos passos

1. Implementar os componentes base em `packages/ui` (`Button`, `Card`, `PlanCard`, `CategoryChip`, `Header`, `Footer`).
2. Construir a home page usando a hierarquia documentada.
3. Validar contraste AA nos pares já críticos: `text-foreground` sobre `bg-background`, `bg-card`, `bg-muted`, `bg-primary`.
4. Testar densidade de grid em 700px / 975px / 1200px.
5. Substituir `Inter` por `Lexend Deca` em `apps/web/src/app/layout.tsx` quando os componentes já existirem (evita flash de fonte na primeira renderização).
6. ~~Auditar `DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md` e quebrá-lo em documentos por área.~~ **Concluído em 2026-10-20.** O monólito foi quebrado em 18 documentos; o índice está em [docs/README.md](../README.md) e os módulos em [MODULOS/](../MODULOS/README.md).

---

*Documento gerado pela skill `piaro-design-reference`; atualizado em 2026-10-20 após decisão dark-only e conversão de tokens.*