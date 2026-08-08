'use client'

import * as React from 'react'
import { makeStyles, tokens, Button, Badge } from '@fluentui/react-components'
import {
  QrCode20Regular,
  Send20Regular,
  CheckmarkCircle20Regular,
  Sparkle16Regular,
  ArrowRight20Regular,
} from '@fluentui/react-icons'
import { brand, shellMaxWidth, routes } from './brand'
import { TelegramMockup } from './telegram-mockup'

const useStyles = makeStyles({
  section: {
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `linear-gradient(160deg, ${brand.teal}, #04211F)`,
    color: '#FFFFFF',
    paddingTop: '76px',
    paddingBottom: '76px',
  },
  glow: {
    position: 'absolute',
    top: '-120px',
    right: '-80px',
    width: '420px',
    height: '420px',
    borderRadius: '999px',
    backgroundImage: `radial-gradient(circle, rgba(108,248,187,0.22), transparent 68%)`,
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    maxWidth: shellMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '48px',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalL,
  },
  title: {
    margin: 0,
    fontSize: '32px',
    lineHeight: '1.12',
    letterSpacing: '-0.02em',
    fontWeight: tokens.fontWeightBold,
    color: '#FFFFFF',
    textWrap: 'balance',
    '@media (min-width: 960px)': {
      fontSize: '42px',
    },
  },
  mint: { color: brand.mint },
  subtitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    lineHeight: '1.55',
    color: brand.onDark,
    maxWidth: '480px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    width: '100%',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  stepIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: 'rgba(180,237,236,0.14)',
    color: brand.mint,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: '#FFFFFF',
  },
  stepText: {
    margin: 0,
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.45',
    color: brand.onDark,
  },
  proNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: tokens.fontSizeBase200,
    color: brand.onDark,
    backgroundColor: 'rgba(180,237,236,0.10)',
    borderRadius: '12px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '14px',
    paddingRight: '14px',
  },
  visual: {
    display: 'flex',
    justifyContent: 'center',
  },
})

const steps = [
  {
    Icon: QrCode20Regular,
    title: 'Gere seu código de vínculo',
    text: 'Dentro do app, gere um código seguro e envie /vincular no bot. Sua conta conecta na hora — sem depender só do telefone.',
  },
  {
    Icon: Send20Regular,
    title: 'Mande seus gastos por mensagem',
    text: 'Escreva do seu jeito: "gasto uber 55" ou "renda salario 4800". O bot entende e registra automaticamente.',
  },
  {
    Icon: CheckmarkCircle20Regular,
    title: 'Receba a confirmação na hora',
    text: 'O bot confirma cada lançamento e ele já aparece no seu painel, atualizando o saldo do mês em tempo real.',
  },
]

export function TelegramSection() {
  const styles = useStyles()
  return (
    <section className={styles.section} id="telegram">
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Badge appearance="filled" color="success" icon={<Sparkle16Regular />}>
            Comece pelo Telegram
          </Badge>
          <h2 className={styles.title}>
            Registre gastos por{' '}
            <span className={styles.mint}>mensagem</span>, sem abrir o app
          </h2>
          <p className={styles.subtitle}>
            A vida acontece rápido. Acabou de pagar algo? Manda uma mensagem para
            o bot do Economize Já no Telegram e pronto — está registrado. Simples
            assim.
          </p>

          <div className={styles.steps}>
            {steps.map((s) => (
              <div key={s.title} className={styles.step}>
                <span className={styles.stepIcon} aria-hidden="true">
                  <s.Icon />
                </span>
                <div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.proNote}>
            <Sparkle16Regular className={styles.mint} />
            <span>
              Assinantes <strong>Pro</strong> ganham a IA que entende frases
              livres — e em breve tudo isso também no WhatsApp.
            </span>
          </div>

          <Button
            as="a"
            href={routes.register}
            appearance="primary"
            size="large"
            icon={<ArrowRight20Regular />}
            iconPosition="after"
            data-cy="telegram-register-button"
          >
            Quero usar o bot
          </Button>
        </div>

        <div className={styles.visual}>
          <TelegramMockup />
        </div>
      </div>
    </section>
  )
}
