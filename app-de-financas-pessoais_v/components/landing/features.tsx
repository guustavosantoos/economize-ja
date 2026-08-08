'use client'

import * as React from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import {
  ReceiptMoney24Regular,
  DataPie24Regular,
  DataTrending24Regular,
  ChatSparkle24Regular,
  ShieldCheckmark24Regular,
  CalendarClock24Regular,
} from '@fluentui/react-icons'
import { brand, shellMaxWidth, cardShadow } from './brand'
import { SectionHeading } from './section-heading'

const useStyles = makeStyles({
  section: {
    backgroundColor: brand.card,
    paddingTop: '72px',
    paddingBottom: '72px',
  },
  inner: {
    maxWidth: shellMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    backgroundColor: brand.surface,
    borderRadius: '20px',
    paddingTop: '26px',
    paddingBottom: '26px',
    paddingLeft: '24px',
    paddingRight: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    border: `1px solid ${brand.variant}`,
    boxShadow: cardShadow,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '200ms',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 36px rgba(0, 53, 53, 0.10)',
    },
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.mint,
    color: brand.teal,
    marginBottom: tokens.spacingVerticalS,
  },
  cardTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: brand.ink,
  },
  cardText: {
    margin: 0,
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.5',
    color: brand.inkSoft,
  },
})

const features = [
  {
    Icon: ReceiptMoney24Regular,
    title: 'Lançamentos em segundos',
    text: 'Registre despesas, receitas e entradas com valor, categoria, descrição e data. Rápido no celular e no computador.',
  },
  {
    Icon: DataPie24Regular,
    title: 'Gastos por categoria',
    text: 'Um gráfico claro mostra para onde vai o seu dinheiro todo mês. Descubra os vilões do orçamento em um olhar.',
  },
  {
    Icon: DataTrending24Regular,
    title: 'Evolução mensal',
    text: 'Acompanhe seu saldo e a evolução dos gastos ao longo dos meses e veja seu progresso financeiro crescer.',
  },
  {
    Icon: ChatSparkle24Regular,
    title: 'Bot no Telegram',
    text: 'Vincule sua conta e lance gastos por mensagem, tipo "gasto uber 55". O bot confirma e organiza tudo pra você.',
  },
  {
    Icon: ShieldCheckmark24Regular,
    title: 'Seus dados protegidos',
    text: 'Senhas com criptografia forte, dados sensíveis protegidos e controle total: exporte ou apague seus dados quando quiser.',
  },
  {
    Icon: CalendarClock24Regular,
    title: 'Lembretes de contas',
    text: 'Programe contas recorrentes e receba avisos antes do vencimento para nunca mais pagar juros por esquecimento.',
    soon: true,
  },
]

const useBadge = makeStyles({
  soon: {
    alignSelf: 'flex-start',
    fontSize: '11px',
    fontWeight: tokens.fontWeightSemibold,
    color: brand.green,
    backgroundColor: brand.greenSoft,
    borderRadius: '999px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
})

export function Features() {
  const styles = useStyles()
  const badge = useBadge()
  return (
    <section className={styles.section} id="recursos">
      <div className={styles.inner}>
        <SectionHeading
          eyebrow="Tudo em um só lugar"
          title="Suas finanças organizadas, sem complicação"
          subtitle="Ferramentas simples e poderosas para você entender, controlar e fazer seu dinheiro render mais."
        />
        <div className={styles.grid}>
          {features.map((f) => (
            <article key={f.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                <f.Icon />
              </span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardText}>{f.text}</p>
              {f.soon ? <span className={badge.soon}>Em breve</span> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
