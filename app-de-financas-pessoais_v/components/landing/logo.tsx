'use client'

import * as React from 'react'
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components'
import { brand } from './brand'

const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalSNudge,
    textDecorationLine: 'none',
  },
  mark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    backgroundImage: `linear-gradient(140deg, ${brand.teal}, ${brand.tealContainer})`,
    color: brand.mint,
    flexShrink: 0,
  },
  word: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    letterSpacing: '-0.01em',
    lineHeight: '1',
  },
  onDark: {
    color: '#FFFFFF',
  },
  onLight: {
    color: brand.teal,
  },
})

export function Logo({
  onDark = false,
  className,
}: {
  onDark?: boolean
  className?: string
}) {
  const styles = useStyles()
  return (
    <span className={mergeClasses(styles.root, className)} aria-label="Economize Já">
      <span className={styles.mark} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 15.5 9 10l3.5 3.5L20 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 6h5v5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={mergeClasses(styles.word, onDark ? styles.onDark : styles.onLight)}
      >
        Economize Já
      </span>
    </span>
  )
}
