import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Economize Já — Controle suas finanças pelo celular e pelo Telegram',
  description:
    'Registre gastos e receitas em segundos, acompanhe seu saldo em tempo real e lance despesas por mensagem no Telegram. Comece grátis e assuma o controle do seu dinheiro.',
  keywords: [
    'finanças pessoais',
    'controle de gastos',
    'app de finanças',
    'bot financeiro Telegram',
    'orçamento pessoal',
    'economizar dinheiro',
  ],
  openGraph: {
    title: 'Economize Já — Suas finanças no controle',
    description:
      'Registre gastos e receitas em segundos e lance despesas por mensagem no Telegram. Comece grátis.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#003535',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
