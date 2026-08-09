import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('ej_theme') as 'light' | 'dark' | null;
    // Sempre inicia no light mode por padrão, a não ser que o usuário tenha escolhido dark
    const initialTheme = savedTheme ?? 'light';

    set({ theme: initialTheme });
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('ej_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  },

  setTheme: (newTheme: 'light' | 'dark') => {
    set({ theme: newTheme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('ej_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
}));
