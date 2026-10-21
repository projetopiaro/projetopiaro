import type { Metadata } from 'next';
import { Lexend_Deca, Roboto, Roboto_Mono } from 'next/font/google';
import './globals.css';

/**
 * Tipografia extraída do design system do Cifra Club.
 *
 * ⚠️ Lexend Deca e Ourissanga Condensed são fontes proprietárias da
 * Studio Sol e exigem licença para uso comercial. As versões do Google Fonts
 * carregadas aqui são apenas para desenvolvimento — em produção, substitua
 * por alternativas livres (Nunito Sans / Manrope no lugar de Lexend Deca,
 * Oswald / Barlow Condensed no lugar de Ourissanga Condensed) ou obtenha a
 * licença. Ver docs/REFERENCIAS/01-DESIGN-REFERENCE.md — seção 11.
 */
const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Piaro',
  description: 'Streaming, VPN e produtos digitais com entrega instantânea de credenciais',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${lexendDeca.variable} ${roboto.variable} ${robotoMono.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}