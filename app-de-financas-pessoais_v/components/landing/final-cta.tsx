'use client'

import * as React from 'react'
import { makeStyles, tokens, Button } from '@fluentui/react-components'
import {
  ArrowRight20Regular,
  CheckmarkCircle16Regular,
} from '@fluentui/react-icons'
import { brand, shellMaxWidth, routes } from './brand'

const useStyles = makeStyles({
  section: {
    backgroundColor: brand.card,
    paddingTop: '48px',
    paddingBottom: '84px',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    maxWidth: shellMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundImage: `linear-gradient(150deg, ${brand.teal}, #04211F)`,
    borderRadius: '28px',
    paddingTop: '56px',
    paddingBottom: '56px',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
    top: '-140px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '520px',
    height: '340px',
    backgroundImage: `radial-gradient(circle, rgba(108,248,187,0.20), transparent 66%)`,
    pointerEvents: 'none',
  },
  title: {
    position: 'relative',
    margin: 0,
    fontSize: '32px',
    lineHeight: '1.12',
    letterSpacing: '-0.02em',
    fontWeight: tokens.fontWeightBold,
    color: '#FFFFFF',
    textWrap: 'balance',
    maxWidth: '640px',
    '@media (min-width: 960px)': {
      fontSize: '42px',
    },
  },
  subtitle: {
    position: 'relative',
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    lineHeight: '1.55',
    color: brand.onDark,
    maxWidth: '520px',
  },
  reassure: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalXS,
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: tokens.fontSizeBase200,
    color: brand.onDark,
  },
  check: { color: brand.greenContainer },
})

export function FinalCta() {
  const styles = useStyles()
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <span className={styles.glow} aria-hidden="true" />
        <h2 className={styles.title}>
          Seu dinheiro sob controle começa hoje
        </h2>
        <p className={styles.subtitle}>
          Junte-se a quem já parou de se perder com os gastos. Crie sua conta
          grátis e veja a diferença já no primeiro mês.
        </p>
        <Button
          as="a"
          href={routes.register}
          appearance="primary"
          size="large"
          icon={<ArrowRight20Regular />}
          iconPosition="after"
          data-cy="final-register-button"
        >
          Criar minha conta grátis
        </Button>
        <div className={styles.reassure}>
          {['Grátis para começar', 'Sem cartão de crédito', 'Cancele quando quiser'].map(
            (item) => (
              <span key={item} className={styles.item}>
                <CheckmarkCircle16Regular className={styles.check} />
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
