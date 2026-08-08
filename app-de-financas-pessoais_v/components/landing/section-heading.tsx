'use client'

import * as React from 'react'
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components'
import { brand } from './brand'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxWidth: '640px',
  },
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: brand.green,
  },
  title: {
    margin: 0,
    fontSize: '30px',
    lineHeight: '1.15',
    letterSpacing: '-0.02em',
    fontWeight: tokens.fontWeightBold,
    color: brand.teal,
    textWrap: 'balance',
    '@media (min-width: 960px)': {
      fontSize: '38px',
    },
  },
  subtitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase400,
    lineHeight: '1.55',
    color: brand.inkSoft,
    textWrap: 'pretty',
  },
})

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  const styles = useStyles()
  return (
    <div className={mergeClasses(styles.root, center && styles.center)}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  )
}
