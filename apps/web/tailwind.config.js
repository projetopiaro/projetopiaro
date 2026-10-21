/** @type {import('tailwindcss').Config} */
module.exports = {
  // A Piaro é dark-only: não há tema light alterno.
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        // Breakpoints extraídos do Cifra Club: 700 / 975 / 1200.
        // Container máximo: --content-max: 1416px (não 1280px).
        sm: '700px',
        md: '975px',
        lg: '1416px',
      },
    },
    extend: {
      colors: {
        // ── Variáveis shadcn/ui (valores do Cifra Club) ───────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ── Tokens específicos da Piaro ────────────────────────
        header: 'hsl(var(--header))',
        footer: 'hsl(var(--footer))',

        'surface-overlay': 'hsl(var(--surface-overlay))',

                'primary-hover': 'hsl(var(--primary-hover))',
                'primary-hover-alpha': 'hsl(var(--primary-hover-alpha))',

        'border-subtle': 'hsl(var(--border-subtle))',
        'border-strong': 'hsl(var(--border-strong))',
        'border-focus': 'hsl(var(--border-focus))',

        'foreground-secondary': 'hsl(var(--foreground-secondary))',
        'on-media': 'hsl(var(--on-media))',

        // Estados semânticos
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        info: 'hsl(var(--info))',
        discount: 'hsl(var(--discount))',

        // Categorias de streaming
        'cat-video': 'hsl(var(--cat-video))',
        'cat-music': 'hsl(var(--cat-music))',
        'cat-anime': 'hsl(var(--cat-anime))',
        'cat-sports': 'hsl(var(--cat-sports))',
        'cat-vpn': 'hsl(var(--cat-vpn))',
        'cat-cloud': 'hsl(var(--cat-cloud))',
        'cat-software': 'hsl(var(--cat-software))',

        // Fallback de canal RGB para `color-mix()` — usar com barra slash:
        // bg-cat-video-15  ->  rgb(var(--cat-video-rgb) / 0.15)
        'cat-video-15': 'rgb(var(--cat-video-rgb) / 0.15)',
        'cat-music-15': 'rgb(var(--cat-music-rgb) / 0.15)',
        'cat-anime-15': 'rgb(var(--cat-anime-rgb) / 0.15)',
        'cat-sports-15': 'rgb(var(--cat-sports-rgb) / 0.15)',
        'cat-vpn-15': 'rgb(var(--cat-vpn-rgb) / 0.15)',
        'cat-cloud-15': 'rgb(var(--cat-cloud-rgb) / 0.15)',
        'cat-software-15': 'rgb(var(--cat-software-rgb) / 0.15)',
      },

      // ── Raios extraídos do Cifra Club ───────────────────────
      // Alinhado a `piaroRadius` em packages/design-tokens/src/spacing.ts.
      // Nota: `--radius` (10px) é o anchor que o shadcn/ui usa internamente e
      // corresponde ao raio `md` da Piaro. Não use `--radius` como fonte
      // de verdade — `piaroRadius` é a referência canônica.
      // Escala genérica — tokens --r-* do Cifra Club.
      // NOTA: a escala de raios de BOTÃO é separada (piaroButtonRadius),
      // não mapeia para esta escala. Ver borderRadius logo abaixo com prefixo btn-.
      borderRadius: {
        none: '0px',
        xs: '4px',    // --r-xs
        sm: '8px',    // --r-sm
        md: '12px',   // interpolado (sem token oficial)
        lg: '16px',   // --r-lg
        xl: '24px',   // --r-xl
        '2xl': '20px',
        '3xl': '32px',
        full: '999px', // --r-pill

        // Botões — tokens --btn-*-r (reais: .hC0CP[data-size=...]).
        // Prefixo `btn-` evita colisão com a escala genérica.
        'btn-xsm': '6px',
        'btn-sm': '10px',
        'btn-md': '12px',
        'btn-lg': '16px',
      },

      // ── Tipografia extraída do Cifra Club ───────────────────
      fontFamily: {
        // Títulos e headlines. Lexend Deca é proprietária — fallback livre.
        display: ['Lexend Deca', 'Nunito Sans', 'Manrope', 'system-ui', 'sans-serif'],
        // Subtítulos, tags e badges. Ourissanga Condensed é proprietária.
        condensed: ['Ourissanga Condensed', 'Oswald', 'Barlow Condensed', 'system-ui', 'sans-serif'],
        // Texto corrido.
        body: ['Roboto', 'system-ui', 'sans-serif'],
        // Credenciais, códigos e hashes.
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },

      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};