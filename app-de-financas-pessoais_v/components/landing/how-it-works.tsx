'use client'

import * as React from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import { brand, shellMaxWidth } from './brand'
import { SectionHeading } from './section-heading'

const useStyles = makeStyles({
  section: {
    backgroundColor: brand.surface,
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
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalXL,
    width: '100%',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    alignItems: 'flex-start',
  },
  num: {
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
    color: '#FFFFFF',
    backgroundImage: `linear-gradient(140deg, ${brand.teal}, ${brand.tealContainer})`,
  },
  stepTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: brand.ink,
  },
  stepText: {
    margin: 0,
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.5',
    color: brand.inkSoft,
  },
})

const steps = [
  {
    num: '1',
    title: 'Crie sua conta grátis',
    text: 'Cadastre-se com seu e-mail em menos de 2 minutos. Sem cartão de crédito, sem burocracia.',
  },
  {
    num: '2',
    title: 'Registre suas transações',
    text: 'Adicione gastos e receitas pelo app ou mande uma mensagem para o bot no Telegram.',
  },
  {
    num: '3',
    title: 'Acompanhe e economize',
    text: 'Veja seu saldo, os gráficos por categoria e a evolução do mês. Tome decisões melhores com clareza.',
  },
]

export function HowItWorks() {
  const styles = useStyles()
  return (
    <section className={styles.section} id="como-funciona">
      <div className={styles.inner}>
        <SectionHeading
          center
          eyebrow="Simples do início ao fim"
          title="Comece a economizar em 3 passos"
        />
        <div className={styles.grid}>
          {steps.map((s) => (
            <div key={s.num} className={styles.step}>
              <span className={styles.num} aria-hidden="true">
                {s.num}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
