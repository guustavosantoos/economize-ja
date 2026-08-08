'use client'

import * as React from 'react'
import { makeStyles, tokens, Button, Badge } from '@fluentui/react-components'
import {
  ArrowRight20Regular,
  ChatSparkle16Regular,
  CheckmarkCircle16Regular,
} from '@fluentui/react-icons'
import { brand, shellMaxWidth, routes } from './brand'
import { AppMockup } from './app-mockup'

const useStyles = makeStyles({
  section: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: brand.surface,
    backgroundImage: `radial-gradient(900px 500px at 85% -10%, ${brand.mintSoft}, transparent 60%), radial-gradient(700px 400px at 0% 10%, rgba(108, 248, 187, 0.14), transparent 55%)`,
  },
  inner: {
    maxWidth: shellMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    paddingTop: '56px',
    paddingBottom: '64px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '48px',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      gridTemplateColumns: '1.05fr 0.95fr',
      paddingTop: '80px',
      paddingBottom: '96px',
    },
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalL,
    textAlign: 'left',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  title: {
    margin: 0,
    fontSize: '40px',
    lineHeight: '1.06',
    letterSpacing: '-0.03em',
    fontWeight: tokens.fontWeightBold,
    color: brand.teal,
    textWrap: 'balance',
    '@media (min-width: 960px)': {
      fontSize: '56px',
    },
  },
  highlight: {
    color: brand.green,
  },
  subtitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    lineHeight: '1.55',
    color: brand.inkSoft,
    maxWidth: '520px',
    textWrap: 'pretty',
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXS,
  },
  reassure: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalXS,
  },
  reassureItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: tokens.fontSizeBase200,
    color: brand.inkSoft,
  },
  check: {
    color: brand.green,
  },
  visual: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatCard: {
    position: 'absolute',
    bottom: '32px',
    left: '-4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: brand.card,
    borderRadius: '16px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '14px',
    paddingRight: '16px',
    boxShadow: '0 12px 32px rgba(0, 53, 53, 0.16)',
    maxWidth: '210px',
    '@media (max-width: 520px)': {
      display: 'none',
    },
  },
  floatIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    backgroundColor: brand.mint,
    color: brand.teal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  floatText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.3',
  },
  floatTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: brand.ink,
  },
  floatSub: {
    fontSize: '11px',
    color: brand.outline,
  },
})

const reassurances = [
  'Grátis para começar',
  'Sem cartão de crédito',
  'Pronto em 2 minutos',
]

export function Hero() {
  const styles = useStyles()
  return (
    <section className={styles.section} id="topo">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Badge
            appearance="tint"
            color="success"
            size="large"
            className={styles.eyebrow}
            icon={<ChatSparkle16Regular />}
          >
            Novo: lance gastos direto no Telegram
          </Badge>

          <h1 className={styles.title}>
            Assuma o controle do seu dinheiro{' '}
            <span className={styles.highlight}>sem planilhas</span>
          </h1>

          <p className={styles.subtitle}>
            O Economize Já organiza suas despesas e receitas em segundos. Veja
            para onde vai cada real, acompanhe seu saldo em tempo real e registre
            gastos por mensagem — de qualquer lugar, pelo celular.
          </p>

          <div className={styles.ctaRow}>
            <Button
              as="a"
              href={routes.register}
              appearance="primary"
              size="large"
              icon={<ArrowRight20Regular />}
              iconPosition="after"
              data-cy="hero-register-button"
            >
              Criar minha conta grátis
            </Button>
            <Button
              as="a"
              href={routes.login}
              appearance="outline"
              size="large"
              data-cy="hero-login-button"
            >
              Já tenho conta
            </Button>
          </div>

          <div className={styles.reassure}>
            {reassurances.map((item) => (
              <span key={item} className={styles.reassureItem}>
                <CheckmarkCircle16Regular className={styles.check} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.visual}>
          <AppMockup />
          <div className={styles.floatCard}>
            <span className={styles.floatIcon} aria-hidden="true">
              <ChatSparkle16Regular />
            </span>
            <span className={styles.floatText}>
              <span className={styles.floatTitle}>&ldquo;gasto uber 55&rdquo;</span>
              <span className={styles.floatSub}>registrado em 1 segundo</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
