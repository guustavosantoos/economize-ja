'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', dataCy: 'nav-dashboard-link' },
  { href: '/transactions', icon: 'receipt_long', label: 'Transações', dataCy: 'nav-transactions-link' },
  { href: '/settings/telegram', icon: 'send', label: 'Telegram', dataCy: 'nav-telegram-link' },
  { href: '/settings', icon: 'person', label: 'Perfil', dataCy: 'nav-profile-link' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { logoutAction } = useAuthStore();
  const { theme, toggleTheme, initTheme, sidebarCollapsed, toggleSidebar } = useThemeStore();
  const router = useRouter();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  function isActive(item: { href: string }) {
    if (item.href === '/settings') {
      return pathname === '/settings' || pathname.startsWith('/settings/pro');
    }
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    await logoutAction();
    router.push('/login');
  }

  return (
    <>
      {/* ── Desktop: Sidebar vertical colapsável ── */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-full bg-white dark:bg-[#111827] border-r border-surface-variant dark:border-[#1f2937] flex-col z-50 transition-all duration-200 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo + Botão Colapsar */}
        <div className="p-4 border-b border-surface-variant dark:border-[#1f2937] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Economize Já Logo"
              width={40}
              height={40}
              className="rounded-xl object-contain w-10 h-10 border border-surface-variant dark:border-[#1f2937] bg-white p-0.5 flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="truncate">
                <p className="font-extrabold text-on-surface text-sm leading-tight truncate">Economize Já</p>
                <p className="text-[10px] text-outline font-medium truncate">Controle Financeiro</p>
              </div>
            )}
          </div>

          {/* Botão para Fechar / Abrir Sidebar (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg bg-surface-container dark:bg-[#1f2937] text-on-surface-variant dark:text-slate-300 flex items-center justify-center hover:bg-surface-container-high transition-all"
            title={sidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            <span className="material-symbols-outlined text-base" style={{ pointerEvents: 'none' }}>
              {sidebarCollapsed ? 'menu_open' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-cy={item.dataCy}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-emerald-400 dark:text-slate-950 shadow-xs'
                    : 'text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-[#1f2937]'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <span
                  className={`material-symbols-outlined text-lg flex-shrink-0 ${active ? 'filled' : ''}`}
                  style={{ pointerEvents: 'none' }}
                >
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Dark Mode Toggle & Logout */}
        <div className="p-3 border-t border-surface-variant dark:border-[#1f2937] space-y-1">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant dark:text-slate-300 hover:bg-surface-container dark:hover:bg-[#1f2937] transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Alternar Tema (Claro / Escuro)"
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0 text-amber-500" style={{ pointerEvents: 'none' }}>
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-outline hover:bg-surface-container dark:hover:bg-[#1f2937] transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Sair"
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ pointerEvents: 'none' }}>logout</span>
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile: Bottom nav com Dark Mode Toggle ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white dark:bg-[#111827] border-t border-surface-variant dark:border-[#1f2937] flex items-center justify-around z-50">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-cy={item.dataCy}
              className="flex flex-col items-center justify-center w-full h-full gap-0.5"
            >
              <span
                className={`material-symbols-outlined text-xl ${active ? 'filled text-primary dark:text-[#34d399]' : 'text-outline'}`}
                style={{ pointerEvents: 'none' }}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold ${active ? 'text-primary dark:text-[#34d399]' : 'text-outline'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mobile Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-outline"
          title="Alternar Tema"
        >
          <span className="material-symbols-outlined text-lg text-amber-500" style={{ pointerEvents: 'none' }}>
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="text-[10px] font-bold">Tema</span>
        </button>
      </nav>
    </>
  );
}
