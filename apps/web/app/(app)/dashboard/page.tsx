'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import TransactionItem from '../../../components/TransactionItem';
import PwaInstallPrompt from '../../../components/PwaInstallPrompt';
import CategoryManagerModal from '../../../components/CategoryManagerModal';
import { useThemeStore } from '../../../stores/theme.store';
import { useAuthStore } from '../../../stores/auth.store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Summary = {
  currentBalance: number;
  monthBalance?: number;
  totalIncome: number;
  totalExpense: number;
  previousMonthBalance: number;
  monthChangePercentage: number;
  creditCard?: {
    limit: number;
    spent: number;
    remaining: number;
    usedPercentage: number;
    status: 'none' | 'ok' | 'warning' | 'danger' | 'exceeded';
  };
};

type CategoryData = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percentage: number;
};

type EvolutionData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

type CalendarDay = {
  date: string;
  dayNumber: number;
  totalIncome: number;
  totalExpense: number;
  transactions: any[];
};

type CalendarData = {
  year: number;
  month: number;
  yearMonth: string;
  days: CalendarDay[];
};

type Transaction = {
  id: string;
  description: string;
  amount: number | string;
  type: string;
  source: string;
  date: string;
  createdAt: string;
  category?: { name: string; icon: string };
};

const EXPENSE_RED = '#e11d48';

function formatBRL(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount || 0);
}

export default function Dashboard() {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [forceOpenPwa, setForceOpenPwa] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const isIos = /iPhone|iPad|iPod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      if (isIos && !isStandalone) {
        setIsAppleDevice(true);
      }
    }
  }, []);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [allUserCategories, setAllUserCategories] = useState<any[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  // Modals & Banners
  const [showOpenFinanceBanner, setShowOpenFinanceBanner] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ label: string; data: EvolutionData } | null>(null);
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [loadingMonthTx, setLoadingMonthTx] = useState(false);

  const fetchCalendar = useCallback(async (yearMonthStr: string) => {
    try {
      const res = await apiClient.get(`/dashboard/calendar?month=${yearMonthStr}`);
      if (res) setCalendarData(res);
    } catch (err) {
      console.error('Error fetching calendar:', err);
    }
  }, []);

  const dashboardCacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    async function loadDashboardData() {
      // 🚀 1. Se já tiver dados em cache para este mês, exibe instantaneamente (0ms latency)
      if (dashboardCacheRef.current[calendarMonth]) {
        const cached = dashboardCacheRef.current[calendarMonth];
        setSummary(cached.summary);
        setCategoriesData(cached.categoriesData);
        setRecentTransactions(cached.recentTransactions);
        setCalendarData(cached.calendarData);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const [yearStr, monthStr] = calendarMonth.split('-');
        const lastDay = new Date(Number(yearStr), Number(monthStr), 0).getDate();
        const startDate = `${calendarMonth}-01`;
        const endDate = `${calendarMonth}-${String(lastDay).padStart(2, '0')}`;

        const [sumRes, catRes, evoRes, txRes, calRes, allCatRes] = await Promise.allSettled([
          apiClient.get(`/dashboard/summary?month=${calendarMonth}`),
          apiClient.get(`/dashboard/by-category?month=${calendarMonth}`),
          apiClient.get('/dashboard/monthly-evolution'),
          apiClient.get(`/transactions?startDate=${startDate}&endDate=${endDate}`),
          apiClient.get(`/dashboard/calendar?month=${calendarMonth}`),
          apiClient.get('/categories'),
        ]);

        const freshSummary = sumRes.status === 'fulfilled' ? sumRes.value : null;
        const freshCat = catRes.status === 'fulfilled' && Array.isArray(catRes.value) ? catRes.value : [];
        const freshEvo = evoRes.status === 'fulfilled' && Array.isArray(evoRes.value) ? evoRes.value : [];
        const freshTx = txRes.status === 'fulfilled' && Array.isArray(txRes.value) ? txRes.value.slice(0, 5) : [];
        const freshCal = calRes.status === 'fulfilled' ? calRes.value : null;
        const freshAllCat = allCatRes.status === 'fulfilled' && Array.isArray(allCatRes.value) ? allCatRes.value : [];

        if (freshSummary) setSummary(freshSummary);
        if (freshCat.length > 0) setCategoriesData(freshCat);
        if (freshEvo.length > 0) setEvolutionData(freshEvo);
        setRecentTransactions(freshTx);
        if (freshCal) setCalendarData(freshCal);
        if (freshAllCat.length > 0) setAllUserCategories(freshAllCat);

        // Guardar em cache local
        dashboardCacheRef.current[calendarMonth] = {
          summary: freshSummary,
          categoriesData: freshCat,
          recentTransactions: freshTx,
          calendarData: freshCal,
        };
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCalendarMonth(newStr);
    fetchCalendar(newStr);
  };

  const handleNextMonth = () => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCalendarMonth(newStr);
    fetchCalendar(newStr);
  };

  const handleMonthClick = useCallback(async (entry: EvolutionData) => {
    setSelectedMonth({ label: entry.month, data: entry });
    setLoadingMonthTx(true);
    try {
      const monthMap: Record<string, string> = {
        Jan: '01', Fev: '02', Mar: '03', Abr: '04',
        Mai: '05', Jun: '06', Jul: '07', Ago: '08',
        Set: '09', Out: '10', Nov: '11', Dez: '12',
      };
      const parts = entry.month.split('/');
      const mon = monthMap[parts[0]] || '01';
      const yr = parts[1] ? `20${parts[1]}` : `${new Date().getFullYear()}`;
      const startDate = `${yr}-${mon}-01`;
      const lastDay = new Date(parseInt(yr), parseInt(mon), 0).getDate();
      const endDate = `${yr}-${mon}-${lastDay}`;

      const txs = await apiClient.get(`/transactions?startDate=${startDate}&endDate=${endDate}`);
      setMonthTransactions(Array.isArray(txs) ? txs : []);
    } catch {
      setMonthTransactions([]);
    } finally {
      setLoadingMonthTx(false);
    }
  }, []);

  const balance = summary?.currentBalance ?? 0;
  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;
  const creditCard = summary?.creditCard;

  const firstDayOfMonthIndex = calendarData
    ? new Date(calendarData.year, calendarData.month - 1, 1).getDay()
    : 0;

  const currentMonthLabel = calendarData
    ? new Date(calendarData.year, calendarData.month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';
  const formattedMonthLabel = currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1);

  const maxDailyExpense = calendarData
    ? Math.max(...calendarData.days.map((d) => d.totalExpense), 1)
    : 1;

  // Base Category preset with keyword accumulation
  const BASE_CATEGORIES = [
    { name: 'Alimentação', icon: 'restaurant', color: '#f97316', keywords: ['alimentação', 'alimentacao', 'restaurante', 'comida', 'ifood', 'mercado', 'almoço', 'jantar', 'padaria', 'lanche'] },
    { name: 'Transporte', icon: 'directions_car', color: '#3b82f6', keywords: ['transporte', 'uber', '99', 'combustível', 'gasolina', 'ônibus', 'carro', 'táxi', 'estacionamento', 'pedágio'] },
    { name: 'Moradia', icon: 'home', color: '#10b981', keywords: ['moradia', 'aluguel', 'luz', 'água', 'internet', 'casa', 'condomínio', 'gás', 'energia'] },
    { name: 'Lazer & Estilo', icon: 'sports_esports', color: '#8b5cf6', keywords: ['lazer', 'estilo', 'cinema', 'jogo', 'viagem', 'jogos', 'vestuário', 'roupas', 'show', 'festas'] },
    { name: 'Saúde & Bem-estar', icon: 'health_and_safety', color: '#ef4444', keywords: ['saúde', 'saude', 'farmácia', 'médico', 'remédio', 'academia', 'hospital', 'dentista'] },
    { name: 'Compras & Presentes', icon: 'shopping_bag', color: '#ec4899', keywords: ['compras', 'presente', 'presentes', 'loja', 'shopping', 'eletrônicos', 'amazon'] },
    { name: 'Educação', icon: 'school', color: '#06b6d4', keywords: ['educação', 'educacao', 'curso', 'livro', 'faculdade', 'escola', 'treinamento'] },
    { name: 'Outros / Imprevistos', icon: 'more_horiz', color: '#64748b', keywords: ['outros', 'imprevistos', 'sem categoria', 'geral', 'diversos', 'taxas', 'impostos'] },
  ];

  const getCategoryTotal = (baseCat: typeof BASE_CATEGORIES[0]) => {
    let sum = 0;
    categoriesData.forEach((c) => {
      const cName = c.name.toLowerCase().trim();
      const isOther = baseCat.name.startsWith('Outros');

      const matchesKeyword = baseCat.keywords.some((kw) => cName.includes(kw));
      const exactNameMatch = cName === baseCat.name.toLowerCase();

      if (exactNameMatch || matchesKeyword) {
        sum += c.total;
      } else if (isOther) {
        const matchedOtherBase = BASE_CATEGORIES.slice(0, 7).some((b) =>
          b.keywords.some((kw) => cName.includes(kw)) || cName === b.name.toLowerCase()
        );
        if (!matchedOtherBase) {
          sum += c.total;
        }
      }
    });
    return sum;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 text-on-surface">
      {/* Prompt / Tutorial de Instalação do PWA */}
      <PwaInstallPrompt forceOpen={forceOpenPwa} onCloseForce={() => setForceOpenPwa(false)} />

      {/* ── Top Bar Header (Crafted Studio Layout) ── */}
      <header className="flex justify-between items-center border-b border-surface-variant dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h1 className="font-extrabold text-on-surface text-xl sm:text-2xl tracking-tight">Painel Financeiro</h1>
          </div>
          <p className="text-xs text-outline dark:text-slate-400 font-medium mt-0.5">Visão consolidada do mês vigente</p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAppleDevice && (
            <button
              onClick={() => setForceOpenPwa(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-extrabold hover:bg-emerald-500/20 transition-all shadow-2xs"
              title="Como instalar o aplicativo na tela de início"
            >
              <span className="material-symbols-outlined text-base">install_mobile</span>
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#111827] border border-surface-variant dark:border-[#1f2937] flex items-center justify-center text-amber-500 hover:border-slate-400 transition-all shadow-xs"
            title="Alternar Tema (Claro / Escuro)"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <Link
            href={user?.plan === 'pro' ? '/settings/telegram' : '/pro'}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0088cc] text-white hover:bg-[#0077b3] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">send</span>
            Bot Telegram
            {user?.plan !== 'pro' && (
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ml-0.5">PRO</span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Open Finance Feature Banner ── */}
      {showOpenFinanceBanner && (
        <div className="bg-slate-900 dark:bg-[#111827] border border-slate-800 p-4 rounded-2xl text-white flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-white">Conexão Bancária Open Finance</p>
              <p className="text-[11px] text-slate-400">Nubank, Itaú, Bradesco, Banco do Brasil e caixas integrados.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <Link
              href="/pro"
              className="bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-emerald-300 transition-all flex-shrink-0"
            >
              Conectar
            </Link>
            <button
              onClick={() => setShowOpenFinanceBanner(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Header Principal (Saldo do Mês + Entradas / Gastos) ── */}
      <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs space-y-6 text-center">
        {/* Seletor de Mês Central */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg bg-surface-variant dark:bg-[#1f2937] flex items-center justify-center text-on-surface dark:text-slate-200 hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-outline dark:text-slate-400 px-2">
            {formattedMonthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg bg-surface-variant dark:bg-[#1f2937] flex items-center justify-center text-on-surface dark:text-slate-200 hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Big Balance */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline dark:text-slate-400">Saldo do Mês</p>
          <h2
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1 ${
              (summary?.monthBalance ?? (income - expense)) < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-[#006c49] dark:text-[#34d399]'
            }`}
          >
            {loading ? 'R$ ...' : formatBRL(summary?.monthBalance ?? (income - expense))}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Saldo acumulado em conta: <strong>{formatBRL(summary?.currentBalance || 0)}</strong>
          </p>
        </div>

        {/* Entradas & Gastos (Cards Refinados) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* ENTRADAS */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-4 rounded-xl flex items-center justify-between text-left">
            <div>
              <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">call_made</span> Entradas
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-900 dark:text-emerald-300 tabular-nums mt-1">
                {loading ? '...' : formatBRL(income)}
              </p>
            </div>
            <Link href="/transactions" className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              Ver todas ›
            </Link>
          </div>

          {/* GASTOS */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 p-4 rounded-xl flex items-center justify-between text-left">
            <div>
              <div className="flex items-center gap-1 text-rose-800 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">call_received</span> Gastos
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-rose-900 dark:text-rose-300 tabular-nums mt-1">
                {loading ? '...' : formatBRL(expense)}
              </p>
            </div>
            <Link href="/transactions" className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline">
              Ver todas ›
            </Link>
          </div>
        </div>
      </div>

      {/* ── Linha Intermediária: Próximos Compromissos & Meta do Mês ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Próximos compromissos */}
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-lg">event</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Próximos compromissos</h4>
              <p className="text-xs text-outline leading-tight">Cadastre contas a vencer.</p>
            </div>
          </div>
          <Link
            href="/transactions/new"
            className="px-3 py-1.5 bg-surface-variant dark:bg-[#1f2937] text-on-surface dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-surface-container transition-all flex-shrink-0"
          >
            Cadastrar
          </Link>
        </div>

        {/* Defina sua meta do mês */}
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-lg">track_changes</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Defina sua meta do mês</h4>
              <p className="text-xs text-outline leading-tight">
                {creditCard && creditCard.limit > 0
                  ? `Meta: ${formatBRL(creditCard.limit)} (${creditCard.usedPercentage}% gasto)`
                  : 'Orçamento de cartão do mês.'}
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-3 py-1.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:opacity-90 transition-all flex-shrink-0"
          >
            {creditCard && creditCard.limit > 0 ? 'Editar' : 'Definir'}
          </Link>
        </div>
      </div>

      {/* ── Grid Principal: Mapa de Calor + Onde Foi Seu Dinheiro ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔥 MAPA DE CALOR (Gasto por dia) */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-lg">local_fire_department</span>
              <h3 className="font-extrabold text-on-surface text-base">Mapa de calor</h3>
            </div>
            <span className="text-xs text-outline font-semibold">Gasto por dia</span>
          </div>

          {/* Grid de Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-outline uppercase tracking-wider">
            <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
          </div>

          {/* Grid do Mapa de Calor (Square-Rounded Handcrafted Tiles) */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfMonthIndex }).map((_, idx) => (
              <div key={`empty-heat-${idx}`} className="h-9 rounded-lg bg-transparent" />
            ))}

            {calendarData?.days.map((day) => {
              const exp = day.totalExpense;
              const intensity = exp > 0 ? Math.min(1, exp / (maxDailyExpense || 1)) : 0;
              const hasBillReminder = day.transactions.some((t: any) => t.isBillReminder);

              let heatBg = 'bg-surface-variant/40 dark:bg-[#1f2937] text-outline';
              if (exp > 0) {
                if (intensity > 0.6) heatBg = 'bg-rose-600 text-white font-black shadow-xs';
                else if (intensity > 0.3) heatBg = 'bg-rose-500 text-white font-bold';
                else heatBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
              }

              if (hasBillReminder && exp === 0) {
                heatBg = 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/60';
              }

              return (
                <button
                  key={`heat-${day.date}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 rounded-lg flex items-center justify-center text-xs transition-all hover:scale-105 active:scale-95 relative ${heatBg} ${
                    hasBillReminder ? 'ring-2 ring-amber-500 shadow-xs' : ''
                  }`}
                  title={`${day.dayNumber}: ${exp > 0 ? formatBRL(exp) : 'Lembrete de Conta'}`}
                >
                  {day.dayNumber}
                  {hasBillReminder && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 💡 ONDE FOI SEU DINHEIRO (Categorias no formato TaskLine) */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary dark:text-[#34d399] text-lg">category</span>
              <h3 className="font-extrabold text-on-surface text-base">Onde foi seu dinheiro</h3>
            </div>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="text-xs text-primary dark:text-[#34d399] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span> Editar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-0.5">
            {allUserCategories.filter((c) => c.type === 'expense' && (c.showInDashboard ?? true)).length > 0
              ? allUserCategories
                  .filter((c) => c.type === 'expense' && (c.showInDashboard ?? true))
                  .map((cat) => {
                    const spentData = categoriesData.find(
                      (cd) => cd.categoryId === cat.id || cd.name.toLowerCase() === cat.name.toLowerCase()
                    );
                    const total = spentData ? Number(spentData.total) : 0;

                    return (
                      <div
                        key={cat.id || cat.name}
                        className="bg-slate-50/70 dark:bg-[#161f2e] p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#1f2937] flex items-center gap-3 shadow-2xs hover:border-emerald-500/40 transition-all"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 shadow-2xs font-bold"
                          style={{ background: cat.color || '#3b82f6' }}
                        >
                          <span className="material-symbols-outlined text-base">{cat.icon || 'shopping_bag'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{cat.name}</p>
                          <p className="text-xs font-black text-slate-700 dark:text-emerald-400 tabular-nums mt-0.5">
                            {formatBRL(total)}
                          </p>
                        </div>
                      </div>
                    );
                  })
              : categoriesData.map((catData) => (
                  <div
                    key={catData.categoryId || catData.name}
                    className="bg-slate-50/70 dark:bg-[#161f2e] p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#1f2937] flex items-center gap-3 shadow-2xs hover:border-emerald-500/40 transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 shadow-2xs font-bold"
                      style={{ background: catData.color || '#3b82f6' }}
                    >
                      <span className="material-symbols-outlined text-base">{catData.icon || 'shopping_bag'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{catData.name}</p>
                      <p className="text-xs font-black text-slate-700 dark:text-emerald-400 tabular-nums mt-0.5">
                        {formatBRL(catData.total)}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* ── Evolução Mensal (Gráfico de Barras Clicável) ── */}
      <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">bar_chart</span>
            Evolução Histórica
          </h3>
          <span className="text-xs text-outline">Clique em um mês para ver os detalhes</span>
        </div>

        {evolutionData.length > 0 ? (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evolutionData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                onClick={(data: any) => {
                  if (data?.activePayload?.[0]?.payload) {
                    handleMonthClick(data.activePayload[0].payload as EvolutionData);
                  }
                }}
              >
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => formatBRL(Number(val))}
                  contentStyle={{ background: '#090d12', borderRadius: '12px', color: '#fff', border: '1px solid #1f2937' }}
                  cursor={{ fill: 'rgba(0,53,53,0.05)', radius: 6 }}
                />
                <Bar dataKey="income" name="Receita" fill="#006c49" radius={[4, 4, 0, 0]} maxBarSize={20} style={{ cursor: 'pointer' }} />
                <Bar dataKey="expense" name="Despesa" fill={EXPENSE_RED} radius={[4, 4, 0, 0]} maxBarSize={20} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-xs text-outline">Nenhum histórico disponível</div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/transactions/new"
        data-cy="dashboard-add-fab"
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 w-13 h-13 bg-secondary text-on-secondary rounded-xl flex items-center justify-center shadow-lg z-40 hover:scale-105 active:scale-95 transition-all"
        title="Nova Transação"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </Link>

      {/* 📅 MODAL DE DETALHES DO DIA (Floating Studio Dialog) */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedDay(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-surface-variant dark:border-[#1f2937] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-on-surface text-base sm:text-lg">
                  Lançamentos do Dia {selectedDay.dayNumber}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs tabular-nums">
                  {selectedDay.totalIncome > 0 && <span className="font-bold text-secondary">+{formatBRL(selectedDay.totalIncome)}</span>}
                  {selectedDay.totalExpense > 0 && <span className="font-bold text-rose-600">-{formatBRL(selectedDay.totalExpense)}</span>}
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-lg bg-surface-container dark:bg-[#1f2937] flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {selectedDay.transactions.length === 0 ? (
                <div className="py-10 text-center text-xs text-outline">Nenhum gasto ou receita registrado nesta data.</div>
              ) : (
                selectedDay.transactions.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-surface-container/40 dark:bg-[#1a2234] border border-surface-variant/40 dark:border-[#1f2937] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
                        <span className="material-symbols-outlined text-base">{tx.category?.icon || 'shopping_bag'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-xs sm:text-sm">{tx.description || 'Sem descrição'}</p>
                        <p className="text-[10px] text-outline">{tx.category?.name || 'Geral'}</p>
                      </div>
                    </div>
                    <span className={`font-extrabold text-xs sm:text-sm tabular-nums ${tx.type === 'income' ? 'text-secondary' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Botão Adicionar Lançamento Nesta Data */}
            <div className="p-4 border-t border-surface-variant dark:border-[#1f2937] bg-surface-container/20 dark:bg-[#111827]">
              <Link
                href={`/transactions/new?date=${selectedDay.date}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                Adicionar lançamento para esta data
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Month Detail Drawer */}
      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedMonth(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
            <div className="px-5 py-4 border-b border-surface-variant dark:border-[#1f2937] flex items-center justify-between">
              <h3 className="font-extrabold text-on-surface text-base">{selectedMonth.label}</h3>
              <button onClick={() => setSelectedMonth(null)} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {monthTransactions.map((t) => (
                <TransactionItem
                  key={t.id}
                  id={t.id}
                  category={t.category?.name || 'Geral'}
                  categoryIcon={t.category?.icon || 'shopping_bag'}
                  name={t.description || 'Transação'}
                  source={t.source === 'bot_free' ? 'Telegram' : 'Web'}
                  amount={typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount}
                  type={t.type === 'income' ? 'income' : 'expense'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Categorias */}
      <CategoryManagerModal
        isOpen={showCategoryManager}
        categories={allUserCategories}
        onClose={() => setShowCategoryManager(false)}
        onCategoriesChanged={() => {
          const [yearStr, monthStr] = calendarMonth.split('-');
          const lastDay = new Date(Number(yearStr), Number(monthStr), 0).getDate();
          const startDate = `${calendarMonth}-01`;
          const endDate = `${calendarMonth}-${String(lastDay).padStart(2, '0')}`;
          apiClient.get(`/dashboard/by-category?month=${calendarMonth}`).then((res) => {
            if (Array.isArray(res)) setCategoriesData(res);
          });
          apiClient.get('/categories').then((res) => {
            if (Array.isArray(res)) setAllUserCategories(res);
          });
        }}
      />
    </div>
  );
}
