/**
 * Piaro Design Tokens — Tipografia
 *
 * Adaptado do design system do Cifra Club para o contexto da Piaro.
 *
 * Referência: docs/DESIGN-REFERENCE.md — seção 3
 */

/**
 * Famílias tipográficas extraídas do CSS do Cifra Club.
 *
 * ⚠️ Lexend Deca e Ourissanga Condensed são fontes proprietárias e exigem
 * licença para uso comercial. Alternativas livres com métricas similares:
 * - Lexend Deca → "Nunito Sans" ou "Manrope"
 * - Ourissanga Condensed → "Oswald" ou "Barlow Condensed"
 */
export const piaroFonts = {
  /** Títulos de página, headlines do hero. */
  display: ['Lexend Deca', 'Nunito Sans', 'Manrope', 'Helvetica Neue', 'Arial', 'sans-serif'],
  /** Subtítulos, tags, badges. */
  condensed: ['Ourissanga Condensed', 'Oswald', 'Barlow Condensed', 'Helvetica Neue', 'Arial', 'sans-serif'],
  /** Texto corrido, descrições, labels. */
  body: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  /** Credenciais, códigos, hashes. */
  mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

/**
 * Escala tipográfica.
 *
 * Tradução do sistema de "data-size" do Cifra Club para uma escala legível.
 */
export const piaroFontSizes = {
  xs: ['0.75rem', { lineHeight: '1rem' }],       // captionFixedNormalBase (12px)
  sm: ['0.875rem', { lineHeight: '1.25rem' }],    // bodyFixedNormalSmall (14px)
  base: ['1rem', { lineHeight: '1.5rem' }],        // bodyFixedNormalBase (16px)
  lg: ['1.125rem', { lineHeight: '1.75rem' }],     // bodyFixedStrongestBase (18px)
  xl: ['1.4rem', { lineHeight: '1.8rem' }],        // titleDynamicUpStrongSmall (22px)
  '2xl': ['1.75rem', { lineHeight: '2.1rem' }],    // titleDynamicUpStrongBase (28px)
  '4xl': ['2.5rem', { lineHeight: '2.8rem' }],     // displayDynamicUpStrongBase (40px)
  '5xl': ['3.5rem', { lineHeight: '3.9rem' }],     // displayDynamicUpStrongLarge (56px)
} as const;

/**
 * Tamanhos fora da escala Tailwind padrão.
 *
 * `labelFixedNormalBase` (13px) e `contentMonoFixedNormalBase` (14px) não têm
 * classe equivalente no Tailwind — `text-xs` é 12px, não 13px. Expostos aqui
 * como utilitários nomeados para uso via classe arbitrária ou plugin.
 */
export const piaroFontSizesCustom = {
  label: '0.8125rem', // 13px — labelFixedNormalBase (labels, badges, meta)
  contentMono: '0.875rem', // 14px — contentMonoFixedNormalBase (mono padrão)
} as const;

/** Pesos disponíveis. */
export const piaroFontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Alturas de linha disponíveis. */
export const piaroLineHeights = {
  tight: '1.2',
  normal: '1.5',
  relaxed: '1.75',
} as const;