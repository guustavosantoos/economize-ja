'use client'

import * as React from 'react'
import { makeStyles, tokens, Button } from '@fluentui/react-components'
import { brand, shellMaxWidth, routes } from './brand'
import { Logo } from './logo'

const useStyles = makeStyles({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: 'rgba(248, 249, 250, 0.82)',
    backdropFilter: 'saturate(180%) blur(12px)',
    borderBottom: `1px solid ${brand.variant}`,
  },
  inner: {
    maxWidth: shellMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
  },
  nav: {
    display: 'none',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXL,
    '@media (min-width: 900px)': {
      display: 'flex',
    },
  },
  link: {
    fontSize: tokens.fontSizeBase300,
    color: brand.inkSoft,
    textDecorationLine: 'none',
    fontWeight: tokens.fontWeightMedium,
    ':hover': {
      color: brand.teal,
    },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  loginBtn: {
    display: 'none',
    '@media (min-width: 560px)': {
      display: 'inline-flex',
    },
  },
})

const navLinks = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#telegram', label: 'Telegram' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#planos', label: 'Planos' },
]

export function SiteHeader() {
  const styles = useStyles()
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#topo" aria-label="Economize Já — início" data-cy="header-logo-link">
          <Logo />
        </a>

        <nav className={styles.nav} aria-label="Navegação principal">
          {navLinks.map((item) => (
            <a key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button
            as="a"
            href={routes.login}
            appearance="subtle"
            className={styles.loginBtn}
            data-cy="header-login-button"
          >
            Entrar
          </Button>
          <Button
            as="a"
            href={routes.register}
            appearance="primary"
            data-cy="header-register-button"
          >
            Criar conta grátis
          </Button>
        </div>
      </div>
    </header>
  )
}
