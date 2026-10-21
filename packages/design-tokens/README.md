# @piaro/design-tokens

Design tokens da **Piaro** — e-commerce de streaming e produtos digitais com assinatura.

Adaptado do design system do **Cifra Club**, com a documentação completa em
[`docs/REFERENCIAS/01-DESIGN-REFERENCE.md`](../../docs/REFERENCIAS/01-DESIGN-REFERENCE.md).

## Decisão de tema

**A Piaro é dark-only.** Não há tokens para tema light. A constante no código é: o objeto `piaroColorsLight` foi removido — apenas `piaroShadcnTokens` e `piaroSpecificTokens` existem, ambos com valores do tema escuro do Cifra Club.

## Conteúdo

| Arquivo | Conteúdo |
|---|---|
| `src/colors.ts` | Tokens de cor em hex + HSL de 3 canais, agrupados em `piaroShadcnTokens` (variáveis que o shadcn/ui já esperava) e `piaroSpecificTokens` (novos, da Piaro). Conversor `hexToHsl` incluído. |
| `src/typography.ts` | Famílias tipográficas e escala de tamanhos |
| `src/spacing.ts` | Espaçamentos, radii, padding de botões, breakpoints, sombras |
| `src/index.ts` | Re-exporta todos os tokens |

## Por que tokens hex E HSL?

Cada cor existe em três formas dentro de `colors.ts`:

1. **`hex`** — referência original (o que aparece em `docs/REFERENCIAS/01-DESIGN-REFERENCE.md`)
2. **`hsl`** — string `"hsl(33 54% 46%)"` para uso em componentes inline
3. **`hslChannels`** — `"33 54% 46%"` (sem vírgulas, sem `hsl()`) para uso como `--variable` em CSS, no formato shadcn `hsl(var(--x) / <alpha>)`

O `globals.css` do frontend consome `hslChannels` direto. Os componentes React podem usar `hsl()` ou `hex()`.

## Uso

```ts
// Pegar o hex (referência de design)
import { piaroShadcnTokens, hexToHsl } from '@piaro/design-tokens';
console.log(piaroShadcnTokens.primary.hex); // "#b77d36"

// Converter hex → HSL de 3 canais em runtime
const channels = hexToHsl('#b77d36'); // "33 54% 46%"

// Apenas a tabela flat de hex (para usar no `tailwind.config.js`)
import { piaroColors } from '@piaro/design-tokens';
// piaroColors.background === '#000000'
```

### Tailwind config

```ts
// apps/web/tailwind.config.js
const { piaroColors, piaroRadius, piaroFonts, piaroFontSizes, piaroBreakpoints } =
  await import('@piaro/design-tokens'); // via package.json workspaces

module.exports = {
  theme: {
    screens: {
      sm: piaroBreakpoints.sm,
      md: piaroBreakpoints.md,
      lg: piaroBreakpoints.lg,
    },
    extend: {
      colors: piaroColors,
      fontFamily: {
        'piaro-display': piaroFonts.display,
        'piaro-condensed': piaroFonts.condensed,
        'piaro-body': piaroFonts.body,
        'piaro-mono': piaroFonts.mono,
      },
      fontSize: piaroFontSizes,
      borderRadius: {
        'piaro-xs': piaroRadius.xs,
        'piaro-sm': piaroRadius.sm,
        'piaro-md': piaroRadius.md,
        'piaro-lg': piaroRadius.lg,
        'piaro-xl': piaroRadius.xl,
        'piaro-2xl': piaroRadius['2xl'],
        'piaro-3xl': piaroRadius['3xl'],
      },
    },
  },
};
```

> O `tailwind.config.js` desta monorepo já está configurado com os tokens acima diretamente — use `bg-piaro-surface` (`bg-card` na convenção shadcn) etc., sem precisar mexer no config.

### CSS custom properties

O `:root` do `globals.css` está completamente populado. Variáveis como `--header`, `--success`, `--cat-video` ficam acessíveis em qualquer arquivo CSS via `hsl(var(--header))`.

## Licença das fontes

`Lexend Deca` e `Ourissanga Condensed` são fontes proprietárias da **Studio Sol** (Cifra Club) e exigem licença para uso comercial. Alternativas livres sugeridas:

| Original | Alternativa livre |
|---|---|
| Lexend Deca | Nunito Sans, Manrope |
| Ourissanga Condensed | Oswald, Barlow Condensed |