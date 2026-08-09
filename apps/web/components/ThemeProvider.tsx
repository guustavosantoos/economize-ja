'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../stores/theme.store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <>{children}</>;
}
