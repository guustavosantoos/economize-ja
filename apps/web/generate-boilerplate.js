#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const p = path.resolve('/Users/gustavobraulio/Desktop/EconomizeJá/apps/web', file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
};

write('stores/auth.store.ts', `
import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

type User = { id: string; email: string; name: string; plan?: string };
type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginAction: (e: string, p: string) => Promise<void>;
  registerAction: (n: string, e: string, p: string) => Promise<void>;
  logoutAction: () => void;
  loadUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  loginAction: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  registerAction: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', { name, email, password });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
  logoutAction: () => {
    localStorage.removeItem('accessToken');
    set({ user: null });
    if (typeof window !== 'undefined') window.location.href = '/login';
  },
  loadUser: async () => {
    if (typeof window === 'undefined' || !localStorage.getItem('accessToken')) return;
    set({ isLoading: true });
    try {
      const data = await apiClient.get('/auth/me');
      set({ user: data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
      localStorage.removeItem('accessToken');
    }
  },
}));
`);

write('components/BottomNav.tsx', `
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', dataCy: 'nav-dashboard-link' },
  { href: '/transactions', icon: 'receipt_long', label: 'Transações', dataCy: 'nav-transactions-link' },
  { href: '/settings/telegram', icon: 'send', label: 'Telegram', dataCy: 'nav-telegram-link' },
  { href: '/settings', icon: 'person', label: 'Perfil', dataCy: 'nav-profile-link' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-surface-container-lowest border-t border-surface-variant flex items-center justify-around md:hidden z-50">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href !== '/settings' || pathname === '/settings' || pathname.startsWith('/settings/pro'));
        return (
          <Link key={item.href} href={item.href} data-cy={item.dataCy} className="flex flex-col items-center justify-center w-full h-full">
            <span className={\`material-symbols-outlined \${isActive ? 'filled text-primary' : 'text-outline'}\`}>
              {item.icon}
            </span>
            <span className={\`text-[10px] mt-1 font-medium \${isActive ? 'text-primary' : 'text-outline'}\`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
`);

write('components/TransactionItem.tsx', `
'use client';

type Props = {
  id: string;
  category: string;
  categoryIcon: string;
  name: string;
  source: string;
  amount: number;
  type: 'income' | 'expense';
};

export default function TransactionItem({ id, category, categoryIcon, name, source, amount, type }: Props) {
  return (
    <div data-cy={\`transaction-item-\${id}\`} className="flex items-center gap-4 py-3 bg-surface-container-lowest border-b border-surface-variant last:border-0 px-4">
      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant">{categoryIcon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-on-surface truncate">{name}</p>
        <p className="text-xs text-outline truncate">{source} · {category}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={\`font-semibold text-sm \${type === 'income' ? 'text-secondary' : 'text-error'}\`}>
          {type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </p>
      </div>
    </div>
  );
}
`);

write('app/(app)/layout.tsx', `
'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { useAuthStore } from '../../stores/auth.store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loadUser, isLoading } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !user && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen pb-[80px]">
      {children}
      <BottomNav />
    </div>
  );
}
`);
