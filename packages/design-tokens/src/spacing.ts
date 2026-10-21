/**
 * Piaro Design Tokens — Espaçamentos, Raios e Breakpoints
 *
 * Adaptado do design system do Cifra Club para o contexto da Piaro.
 *
 * Referência: docs/DESIGN-REFERENCE.md — seção 4
 */

/**
 * Escala de espaçamento.
 *
 * Base de 4px, alinhada aos tokens `--spacing-dynamic-*` do Cifra Club.
 */
export const piaroSpacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  15: '60px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

/**
 * Raios de borda.
 *
 * Escala genérica — tokens `--r-*` do Cifra Club:
 *   --r-xs 4px, --r-sm 8px, --r-lg 16px, --r-xl 24px, --r-pill 999px
 *
 * Os raios por tamanho de botão (`--btn-sm-r`, `--btn-md-r`, `--btn-lg-r`)
 * são diferentes e ficam em `piaroButtonRadius`.
 */
export const piaroRadius = {
  none: '0px',
  xs: '4px',    // --r-xs
  sm: '8px',    // --r-sm
  md: '12px',   // interpolado (não existe token --r-md)
  lg: '16px',   // --r-lg
  xl: '24px',   // --r-xl
  '2xl': '20px',
  full: '999px', // --r-pill
} as const;

/**
 * Botões — sistema oficial do Cifra Club (classe `.hC0CP`).
 *
 * O Cifra Club dimensiona botões por ALTURA FIXA + RAIO, não por padding
 * vertical. O padding é radial (`calc(Xpx - var(--borderWidth))`) e serve
 * apenas para centralizar o conteúdo dentro da altura fixa.
 *
 * @see docs/REFERENCIAS/01-DESIGN-REFERENCE.md — seções 4.2 e 5.7
 */

/** Altura fixa por tamanho de botão (tokens `--btn-*-h`). */
export const piaroButtonHeight = {
  xSmall: '24px',
  sm: '32px',  // --btn-sm-h
  md: '40px',  // --btn-md-h
  lg: '48px',  // --btn-lg-h = clamp(40px,4.6vh,48px)
  xl: '56px',
} as const;

/** Raio por tamanho de botão (tokens `--btn-*-r`). */
export const piaroButtonRadius = {
  xSmall: '6px',
  sm: '10px',  // --btn-sm-r
  md: '12px',  // --btn-md-r
  lg: '16px',  // calc(--btn-lg-h * 0.25)
} as const;

/**
 * Padding de botão.
 *
 * ⚠️ Padding vertical é ZERO em todos os tamanhos — a altura vem de
 * `piaroButtonHeight`. O padding horizontal é radial, calculado para
 * compensar a borda. Com `--borderWidth: 2px`:
 *
 * | Tamanho | Padding | Classe Tailwind equivalente |
 * |---------|---------|-----------------------------|
 * | xSmall  | `2px`   | `px-0.5` (ícone apenas)    |
 * | sm      | `0 4px` | `px-1`                      |
 * | md      | `0 8px` | `px-2`                      |
 * | lg      | `0 10px`| `px-2.5`                    |
 * | xl      | `0 12px`| `px-3`                      |
 *
 * Para texto, use altura fixa + `inline-flex items-center justify-center`.
 * Padding vertical só faz sentido em botões full-width (ex.: `Assinar`).
 */
export const piaroButtonPadding = {
  xSmall: '0 1px',
  sm: '0 4px',
  md: '0 8px',
  lg: '0 10px',
  xl: '0 12px',
} as const;

/**
 * Padding top de containers promocionais (não é botão).
 *
 * ⚠️ NÃO usar como padding de botão. Vem de `.h0BaY` (barra fixa de
 * consentimento, `padding:23px 24px 24px`) e `.PYz3d` (banner de marca,
 * `padding:23px 11px 11px`) no CSS do Cifra Club.
 *
 * Exposto apenas para caso a Piaro crie bottom bar ou banner promo próprio.
 */
export const piaroSpacingBannerTop = '23px' as const;

/**
 * Breakpoints extraídos dos @media queries do CSS do Cifra Club.
 */
export const piaroBreakpoints = {
  /** Mobile — 2 colunas de cards */
  sm: '700px',
  /** Tablet — 4 colunas de cards */
  md: '975px',
  /** Desktop — 6 colunas, header expandido */
  lg: '1200px',
} as const;

/** Colunas de grid por breakpoint. */
export const piaroGridColumns = {
  sm: 2,
  md: 4,
  lg: 6,
} as const;

/** Densidade de listagem por breakpoint. */
export const piaroListDensity = {
  sm: 'compact',
  md: 'comfortable',
  lg: 'comfortable',
} as const;

/** Largura máxima do container. Tokens `--content-max` e `--content`. */
export const piaroContainer = {
  sm: '100%',
  md: '100%',
  /** `--content-max: 1416px` (não 1280px) */
  lg: '1416px',
} as const;

/**
 * Grid.
 *
 * O Cifra Club usa grid de 12 colunas (`--cols: 12`) com gutter de 24px
 * (`--gutter: 24px`).
 */
export const piaroGrid = {
  columns: 12,
  gutter: '24px',
} as const;

/** Alturas de chrome (tokens `--headerHeight`, `--bottomNavHeight`). */
export const piaroChrome = {
  /** `--headerHeight: 56px` */
  header: '56px',
  /** `--bottomNavHeight: 64px` (nav inferior mobile) */
  bottomNav: '64px',
  /** `--stripHeight: 26px` (faixa promocional no topo) */
  strip: '26px',
} as const;

/** Espaçamentos responsivos (tokens `--hero-gap`, `--section-gap`). */
export const piaroLayoutGap = {
  /** `--hero-gap: clamp(24px,4vh,48px)` */
  hero: 'clamp(24px, 4vh, 48px)',
  /** `--section-gap: clamp(88px,13vh,152px)` */
  section: 'clamp(88px, 13vh, 152px)',
} as const;

/** Z-index em camadas. */
export const piaroZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

/** Transições. */
export const piaroTransitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/** Sombras. */
export const piaroShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
} as const;