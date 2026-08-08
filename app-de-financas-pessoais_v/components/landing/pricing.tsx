'use client'

import * as React from 'react'
import { makeStyles, tokens, Button, Badge, mergeClasses } from '@fluentui/react-components'
import {
  Checkmark16Regular,
  Sparkle16Regular,
} from '@fluentui/react-icons'
import { brand, shellMaxWidth, routes, cardShadow } from './brand'
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
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalXL,
    width: '100%',
    maxWidth: '840px',
    alignItems: 'stretch',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    backgroundColor: brand.surface,
    borderRadius: '22px',
    paddingTop: '30px',
    paddingBottom: '30px',
    paddingLeft: '28px',
    paddingRight: '28px',
    border: `1px solid ${brand.variant}`,
    boxShadow: cardShadow,
  },
  cardPro: {
    backgroundImage: `linear-gradient(160deg, ${brand.teal}, #04211F)`,
    border: '1px solid transparent',
    color: '#FFFFFF',
    boxShadow: '0 22px 48px rgba(0,53,53,0.28)',
  },
  planHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  planName: {
    margin: 0,
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: brand.teal,
  },
  planNamePro: { color: '#FFFFFF' },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  price: {
    fontSize: '38px',
    fontWeight: tokens.fontWeightBold,
    letterSpacing: '-0.02em',
    color: brand.ink,
  },
  pricePro: { color: '#FFFFFF' },
  priceUnit: {
    fontSize: tokens.fontSizeBase300,
    color: brand.outline,
  },
  priceUnitPro: { color: brand.onDark },
  tagline: {
    margin: 0,
    fontSize: tokens.fontSizeBase300,
    color: brand.inkSoft,
    minHeight: '40px',
  },
  taglinePro: { color: brand.onDark },
  list: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    flexGrow: 1,
  },
  li: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.45',
    color: brand.inkSoft,
  },
  liPro: { color: brand.onDark },
  checkFree: {
    color: brand.green,
    flexShrink: 0,
    marginTop: '2px',
  },
  checkPro: {
    color: brand.greenContainer,
    flexShrink: 0,
    marginTop: '2px',
  },
})

const freeFeatures = [
  'Transações ilimitadas (gastos e receitas)',
  'Dashboard com saldo e gráficos',
  'Gastos por categoria e evolução mensal',
  'Bot do Telegram com comandos simples',
  'Exportação e exclusão dos seus dados',
]

const proFeatures = [
  'Tudo do plano Free, e mais:',
  'IA no Telegram que entende frases livres',
  'Lembretes de contas com recorrência',
  'WhatsApp (em breve)',
  'Open Finance — conexão com bancos (em breve)',
]

export function Pricing() {
  const styles = useStyles()
  return (
    <section className={styles.section} id="planos">
      <div className={styles.inner}>
        <SectionHeading
          center
          eyebrow="Planos"
          title="Comece de graça, evolua quando quiser"
          subtitle="O plano Free já resolve o seu dia a dia. O Pro chega para quem quer piloto automático nas finanças."
        />
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.planHead}>
              <h3 className={styles.planName}>Free</h3>
              <Badge appearance="tint" color="success">
                Para sempre
              </Badge>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.price}>R$ 0</span>
              <span className={styles.priceUnit}>/ mês</span>
            </div>
            <p className={styles.tagline}>
              Tudo que você precisa para organizar suas finanças e criar o hábito.
            </p>
            <ul className={styles.list}>
              {freeFeatures.map((f) => (
                <li key={f} className={styles.li}>
                  <Checkmark16Regular className={styles.checkFree} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              as="a"
              href={routes.register}
              appearance="outline"
              size="large"
              data-cy="pricing-free-button"
            >
              Criar conta grátis
            </Button>
          </div>

          <div className={mergeClasses(styles.card, styles.cardPro)}>
            <div className={styles.planHead}>
              <h3 className={mergeClasses(styles.planName, styles.planNamePro)}>
                Pro
              </h3>
              <Badge appearance="filled" color="success" icon={<Sparkle16Regular />}>
                Recomendado
              </Badge>
            </div>
            <div className={styles.priceRow}>
              <span className={mergeClasses(styles.price, styles.pricePro)}>
                Em breve
              </span>
            </div>
            <p className={mergeClasses(styles.tagline, styles.taglinePro)}>
              Automação com IA e recursos avançados para quem leva o controle a
              sério.
            </p>
            <ul className={styles.list}>
              {proFeatures.map((f) => (
                <li key={f} className={mergeClasses(styles.li, styles.liPro)}>
                  <Checkmark16Regular className={styles.checkPro} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              as="a"
              href={routes.register}
              appearance="primary"
              size="large"
              data-cy="pricing-pro-button"
            >
              Começar no Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
