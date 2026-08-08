'use client'

import * as React from 'react'
import {
  FluentProvider,
  SSRProvider,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from '@fluentui/react-components'
import { useServerInsertedHTML } from 'next/navigation'

// Brand ramp derived from the Economize Já palette (Deep Teal / Slate Forest).
// brand[80] -> colorBrandBackground (primary buttons) = deep teal for a premium,
// trustworthy fintech feel. Lighter stops feed tints, badges and mint accents.
const economizeBrand: BrandVariants = {
  10: '#00100F',
  20: '#001A19',
  30: '#002322',
  40: '#002D2C',
  50: '#003736',
  60: '#004140',
  70: '#0A4A49',
  80: '#0D4D4D',
  90: '#2A6665',
  100: '#4A807F',
  110: '#6C9B9A',
  120: '#8FB6B5',
  130: '#B4EDEC',
  140: '#CFF0EF',
  150: '#E3F6F5',
  160: '#F1FAF9',
}

const FONT_STACK =
  "var(--font-inter), 'Segoe UI', system-ui, -apple-system, sans-serif"

function withInter(theme: Theme): Theme {
  return {
    ...theme,
    fontFamilyBase: FONT_STACK,
    fontFamilyNumeric: FONT_STACK,
  }
}

// Soften the neutral surfaces to match the off-white (#F8F9FA) app background.
export const economizeLightTheme: Theme = {
  ...withInter(createLightTheme(economizeBrand)),
  colorNeutralBackground1: '#FFFFFF',
  colorNeutralBackground2: '#F8F9FA',
  colorNeutralBackground3: '#F3F4F5',
}

export const economizeDarkTheme: Theme = withInter(
  createDarkTheme(economizeBrand),
)

type ThemeMode = 'light' | 'dark'

const ThemeModeContext = React.createContext<{
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}>({ mode: 'light', setMode: () => {} })

export function useThemeMode() {
  return React.useContext(ThemeModeContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = React.useState(() => createDOMRenderer())
  const didRenderRef = React.useRef(false)
  const [mode, setMode] = React.useState<ThemeMode>('light')

  useServerInsertedHTML(() => {
    if (didRenderRef.current) {
      return
    }
    didRenderRef.current = true
    return <>{renderToStyleElements(renderer)}</>
  })

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <ThemeModeContext.Provider value={{ mode, setMode }}>
          <FluentProvider
            theme={mode === 'light' ? economizeLightTheme : economizeDarkTheme}
            id="__fluent-root"
          >
            {children}
          </FluentProvider>
        </ThemeModeContext.Provider>
      </SSRProvider>
    </RendererProvider>
  )
}
