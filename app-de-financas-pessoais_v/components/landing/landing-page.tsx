'use client'

import * as React from 'react'
import { makeStyles } from '@fluentui/react-components'
import { brand } from './brand'
import { SiteHeader } from './site-header'
import { Hero } from './hero'
import { Features } from './features'
import { TelegramSection } from './telegram-section'
import { HowItWorks } from './how-it-works'
import { Pricing } from './pricing'
import { Faq } from './faq'
import { FinalCta } from './final-cta'
import { SiteFooter } from './site-footer'

const useStyles = makeStyles({
  page: {
    backgroundColor: brand.surface,
    color: brand.ink,
    minHeight: '100vh',
    scrollBehavior: 'smooth',
  },
})

export function LandingPage() {
  const styles = useStyles()
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <TelegramSection />
        <HowItWorks />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
