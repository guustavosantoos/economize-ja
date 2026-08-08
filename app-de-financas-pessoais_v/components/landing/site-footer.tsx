'use client'

import * as React from 'react'
import { makeStyles, tokens } from '@fluentui/react-components'
import { brand, shellMaxWidth, routes } from './brand'
import { Logo } from './logo'

const useStyles = makeStyles({
  footer: {
    backgroundImage: `linear-gradient(180deg, #04211F, ${brand.teal})`,
    color: brand.onDark,
    paddingTop: '56px',
    paddingBottom: '32px',
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
  top: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    '@media (min-width: 720px)': {
      gridTemplateColumns: '1.4fr 1fr 1fr',
    },
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    maxWidth: '320px',
  },
  tagline: {
    margin: 0,
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.5',
    color: brand.onDark,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  colTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: brand.mintDim,
    marginBottom: '4px',
  },
  link: {
    fontSize: tokens.fontSizeBase300,
    color: brand.onDark,
    textDecorationLine: 'none',
    ':hover': { color: '#FFFFFF' },
  },
  bottom: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    borderTop: `1px solid rgba(180,237,236,0.16)`,
    paddingTop: tokens.spacingVerticalL,
    fontSize: tokens.fontSizeBase200,
    color: brand.mintDim,
  },
})

const productLinks = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#telegram', label: 'Bot do Telegram' },
  { href: '#planos', label: 'Planos' },
  { href: '#faq', label: 'Dúvidas' },
]

const accountLinks = [
  { href: routes.register, label: 'Criar conta' },
  { href: routes.login, label: 'Entrar' },
]

export function SiteFooter() {
  const styles = useStyles()
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Logo onDark />
            <p className={styles.tagline}>
              Controle suas finanças pelo celular e pelo Telegram. Simples, seguro
              e feito para o seu dia a dia.
            </p>
          </div>

          <nav className={styles.col} aria-label="Produto">
            <span className={styles.colTitle}>Produto</span>
            {productLinks.map((l) => (
              <a key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </a>
            ))}
          </nav>

          <nav className={styles.col} aria-label="Conta">
            <span className={styles.colTitle}>Conta</span>
            {accountLinks.map((l) => (
              <a key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Economize Já. Todos os direitos reservados.</span>
          <span>Feito para quem quer economizar de verdade.</span>
        </div>
      </div>
    </footer>
  )
}
