/**
 * Piaro Design Tokens — Cores
 *
 * Adaptado do design system do Cifra Club (cifraclub.com.br) para o contexto
 * da Piaro: e-commerce de streaming e produtos digitais com assinatura.
 *
 * Decisão de tema (2026-10-20): **dark-only**.
 *
 * Cada cor existe em três formas:
 * 1. `hex` — o valor original em hexadecimal (referência de design)
 * 2. `hsl` — em HSL de 3 canais, formato natural CSS
 * 3. `hslChannels` — em HSL de 3 canais como string `"H S% L%"` (sem vírgulas),
 *    usado pelo `:root` do `globals.css` no formato `hsl(var(--token) / <alpha>)`
 *    para aceitar variantes com alpha via 4º canal.
 *
 * O `globals.css` deve sempre usar `hslChannels` (string) por causa da regra de
 * 4 canais do shadcn/ui — variáveis hex não compõem alpha.
 *
 * Referência: docs/REFERENCIAS/01-DESIGN-REFERENCE.md — seções 2 e 4.4.
 */

export type HslChannels = `${number} ${number}% ${number}%`;
export type RgbChannels = `${number} ${number} ${number}`;

export interface PiaroColorTokenWithHsl {
  hex: string;
  hsl: string; // ex.: "hsl(28 53% 46%)"
  hslChannels: HslChannels; // ex.: "28 53% 46%"
  rgb: string; // ex.: "hsl(183 125 54 / 0.4)" — com alpha
  rgbChannels: RgbChannels; // ex.: "183 125 54"
}

/** Converte um hexadecimal de 3 ou 6 dígitos em canais RGB. */
export function hexToRgbChannels(hex: string): RgbChannels {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  return `${r} ${g} ${b}`;
}

/**
 * Converte um hexadecimal de 3 ou 6 dígitos em canais HSL.
 * Retorna o formato "H S% L%" (sem vírgulas, sem wrapper `hsl()`), que é
 * o formato que o `:root` do `globals.css` consome via `hsl(var(--x) / a)`.
 */
export function hexToHslChannels(hex: string): HslChannels {
  // Normalizar hex para 6 caracteres
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;

  const r = parseInt(expanded.slice(0, 2), 16) / 255;
  const g = parseInt(expanded.slice(2, 4), 16) / 255;
  const b = parseInt(expanded.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        hue = ((b - r) / delta + 2) * 60;
        break;
      case b:
        hue = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

/** Converte um hexadecimal em uma string `hsl()` completa de 3 canais. */
export function hexToHsl(hex: string): string {
  return `hsl(${hexToHslChannels(hex)})`;
}

function make(hex: string): PiaroColorTokenWithHsl {
  const rgbChannels = hexToRgbChannels(hex);
  return {
    hex,
    hsl: hexToHsl(hex),
    hslChannels: hexToHslChannels(hex),
    rgbChannels,
    rgb: `rgb(${rgbChannels})`,
  };
}

// ────────────────────────────────────────────────────────────────
// Tema escuro — único tema da Piaro (dark-only)
//
// Tokens estão divididos em:
// - "shadcn-preservados": variáveis que o shadcn/ui já espera
//   (background, foreground, primary, etc.) com novos valores da
//   paleta do Cifra Club.
// - "piaro-específicos": tokens próprios da Piaro (surface, border-subtle,
//   estados semânticos, categorias) que não conflitam com shadcn.
// ────────────────────────────────────────────────────────────────

/** Variáveis shadcn/ui com valores da paleta do Cifra Club. */
export const piaroShadcnTokens = {
  background: make('#000000'),
  foreground: make('#f1f1f1'),
  card: make('#1b1b1b'),
  'card-foreground': make('#f1f1f1'),
  popover: make('#262626'),
  'popover-foreground': make('#f1f1f1'),
  primary: make('#b77d36'),
  'primary-foreground': make('#181818'),
  secondary: make('#262626'),
  'secondary-foreground': make('#f1f1f1'),
  muted: make('#262626'),
  'muted-foreground': make('#777777'),
  accent: make('#303030'),
  'accent-foreground': make('#f1f1f1'),
  destructive: make('#ef4444'),
  'destructive-foreground': make('#ffffff'),
  border: make('#1b1b1b'),
  input: make('#474747'),
  ring: make('#b77d36'),
  radius: { css: '0.625rem' }, // 10px — extraído de border-radius:10px do Cifra Club
} as const;

/** Tokens próprios da Piaro (não-shadcn). */
export const piaroSpecificTokens = {
  // Backgrounds adicionais
  'surface-overlay': make('#303030'),
  header: make('#181818'),
  footer: make('#141414'),
  'on-media': make('#ffffff'),

  // Ação
  'primary-hover': make('#c78b3f'),

  // Bordas
  'border-subtle': make('#1b1b1b'),
  'border-strong': make('#474747'),
  'border-focus': make('#5e5e5e'),
  'foreground-secondary': make('#ababab'),

  // Estados semânticos
  success: make('#22c55e'),
  warning: make('#f59e0b'),
  danger: make('#ef4444'),
  info: make('#3b82f6'),
  // Alias de `success` — verde de confirmation usado também em badges de desconto.
  discount: make('#22c55e'),

  // Categorias de streaming
  'cat-video': make('#b77d36'),
  'cat-music': make('#22c55e'),
  'cat-anime': make('#a855f7'),
  'cat-sports': make('#ef4444'),
  'cat-vpn': make('#3b82f6'),
  'cat-cloud': make('#06b6d4'),
  'cat-software': make('#f59e0b'),
} as const;

/** Overlays / alphas (extraídos do `--base-neutral-background-dynamicAlpha-*`). */
export const piaroOverlays = {
  0: 'rgba(0, 0, 0, 0)',
  4: 'hsl(0 0% 100% / 0.04)',
  8: 'hsl(0 0% 100% / 0.08)',
  12: 'hsl(0 0% 100% / 0.12)',
} as const;

/**
 * Variantes com alpha de tokens que precisam de opacidade — declaradas
 * separadamente porque não cabem no formato `HslChannels` (3 canais).
 * Usar direto como string de cor em CSS/React: `hsl(var(--primary) / 0.35)`.
 */
export const piaroAlphaTokens = {
  /** Hover de botões com fundo transparente. */
  'primary-hover-alpha': '33 54% 46% / 0.35',
} as const;

/** Mapa simples (token) → string HSL 3-canais, pronto para `globals.css`. */
export const piaroColorsHslChannels: Record<string, string> = Object.fromEntries(
  Object.values(piaroShadcnTokens)
    .filter((v): v is PiaroColorTokenWithHsl => 'hslChannels' in v)
    .map((v) => [v.hslChannels, v.hslChannels])
    .concat(
      Object.values(piaroSpecificTokens)
        .filter((v): v is PiaroColorTokenWithHsl => 'hslChannels' in v)
        .map((v) => [v.hslChannels, v.hslChannels])
    ),
);

/** Mapa simples (token) → string HSL 3-canais, indexado por nome do token. */
export const piaroColorsByToken: Record<string, PiaroColorTokenWithHsl> = Object.fromEntries(
  Object.entries({
    ...Object.fromEntries(Object.entries(piaroShadcnTokens).filter(([, v]) => 'hex' in v)),
    ...piaroSpecificTokens,
  }).filter(([, v]) => 'hex' in v) as [string, PiaroColorTokenWithHsl][],
);

/** Cores no formato de escala do Tailwind (mantido retrocompatível). */
export const piaroColors = {
  // Backgrounds
  background: '#000000',
  surface: '#1b1b1b',
  'surface-raised': '#262626',
  'surface-overlay': '#303030',
  header: '#181818',
  footer: '#141414',

  // Borders
  'border-subtle': '#1b1b1b',
  'border-strong': '#474747',
  'border-focus': '#5e5e5e',

  // Foregrounds
  foreground: '#f1f1f1',
  'foreground-secondary': '#ababab',
  'text-muted': '#777777',
  'on-media': '#ffffff',

  // Action
  primary: '#b77d36',
  'primary-foreground': '#181818',
  'primary-hover': '#c78b3f',

  // Estados
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  discount: '#22c55e',

  // Overlays
  'overlay-0': piaroOverlays[0],
  'overlay-4': piaroOverlays[4],
  'overlay-8': piaroOverlays[8],
  'overlay-12': piaroOverlays[12],

  // Categorias
  'cat-video': '#b77d36',
  'cat-music': '#22c55e',
  'cat-anime': '#a855f7',
  'cat-sports': '#ef4444',
  'cat-vpn': '#3b82f6',
  'cat-cloud': '#06b6d4',
  'cat-software': '#f59e0b',
} as const;

export type PiaroColorToken = keyof typeof piaroColors;
