// Economize Já brand palette (Deep Teal / Slate Forest).
// Used for marketing-specific styling on top of the Fluent brand theme.
export const brand = {
  teal: '#003535',
  tealContainer: '#0D4D4D',
  mint: '#B4EDEC',
  mintDim: '#98D1D0',
  mintSoft: '#DCF3F2',
  green: '#006C49',
  greenContainer: '#6CF8BB',
  greenSoft: '#E3F7EE',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  low: '#F3F4F5',
  variant: '#E1E3E4',
  ink: '#191C1D',
  inkSoft: '#404848',
  outline: '#707978',
  onDark: '#DDECEB',
} as const

export const cardShadow = '0 4px 12px rgba(13, 77, 77, 0.05)'
export const cardShadowLg = '0 18px 48px rgba(0, 53, 53, 0.14)'
export const shellMaxWidth = '1180px'

// Marketing CTA destinations. The post-signup screens live behind these routes,
// built separately. Update in one place if the routes change.
export const routes = {
  register: '/register',
  login: '/login',
} as const
