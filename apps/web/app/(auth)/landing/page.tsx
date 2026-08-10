'use client';

import Link from 'next/link';
import Image from 'next/image';
import TelegramChatSimulation from '../../../components/TelegramChatSimulation';
import { useThemeStore } from '../../../stores/theme.store';
import { useState } from 'react';

/* ─── Section helpers ─── */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${center ? 'items-center text-center' : 'items-start'} max-w-2xl`}>
      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        {eyebrow}
      </span>
      <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Header ─── */
function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#telegram', label: 'Telegram' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#planos', label: 'Planos' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <a href="#topo" className="flex items-center gap-2.5 font-black text-base sm:text-lg text-slate-900 transition-opacity hover:opacity-90">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
            <Image
              src="/logo.png"
              alt="Economize Já Logo"
              width={32}
              height={32}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="tracking-tight font-extrabold text-slate-900">
            Economize <span className="text-emerald-600 font-extrabold">Já</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs font-bold px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="hidden sm:inline-flex text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:shadow-emerald-600/20 active:scale-95"
          >
            Criar conta grátis
          </Link>

          {/* Mobile CTA (Compact, 1 line) */}
          <Link
            href="/register"
            className="sm:hidden text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-xs whitespace-nowrap"
          >
            Criar Conta
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-xl select-none">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 px-5 py-4 flex flex-col gap-3 bg-white backdrop-blur-md">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center text-xs font-bold py-2.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              Entrar na Conta
            </Link>
            <Link
              href="/register"
              className="w-full text-center text-xs font-bold py-2.5 rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
              onClick={() => setMenuOpen(false)}
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden"
      style={{
        background: '#F8F9FA',
        backgroundImage:
          'radial-gradient(900px 500px at 85% -10%, #DCF3F2, transparent 60%), radial-gradient(700px 400px at 0% 10%, rgba(108,248,187,0.14), transparent 55%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full self-start"
            style={{ background: '#E3F7EE', color: '#006C49' }}
          >
            <span className="material-symbols-outlined text-base" style={{ pointerEvents: 'none', fontSize: '16px' }}>
              chat_bubble
            </span>
            Novo: lance gastos direto no Telegram
          </span>

          <h1
            className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: '#003535', textWrap: 'balance' } as any}
          >
            Assuma o controle do seu dinheiro{' '}
            <span style={{ color: '#006C49' }}>sem planilhas</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-lg" style={{ color: '#404848' }}>
            O Economize Já organiza suas despesas e receitas em segundos. Veja para onde vai cada real, acompanhe seu
            saldo em tempo real e registre gastos por mensagem — de qualquer lugar, pelo celular.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
              style={{ background: '#003535' }}
            >
              Criar minha conta grátis
              <span className="material-symbols-outlined text-lg" style={{ pointerEvents: 'none', fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border-2 transition-all hover:bg-surface-container active:scale-95"
              style={{ borderColor: '#003535', color: '#003535' }}
            >
              Já tenho conta
            </Link>
          </div>

          {/* Reassurances */}
          <div className="flex flex-wrap gap-5 text-xs" style={{ color: '#707978' }}>
            {['Grátis para começar', 'Sem cartão de crédito', 'Pronto em 2 minutos'].map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" style={{ color: '#006C49', pointerEvents: 'none', fontSize: '16px' }}>
                  check_circle
                </span>
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Visual — App mockup */}
        <div className="relative flex justify-center items-center">
          <div
            className="w-full max-w-xs rounded-3xl p-1 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, #003535, #0D4D4D)' }}
          >
            <div className="bg-white rounded-[22px] overflow-hidden">
              {/* Status bar */}
              <div className="h-8 flex items-center justify-center" style={{ background: '#003535' }}>
                <span className="text-white text-xs font-medium opacity-80">Economize Já</span>
              </div>
              {/* Balance card */}
              <div className="p-4" style={{ background: '#003535' }}>
                <p className="text-xs opacity-70 text-white mb-1 uppercase tracking-wider">Saldo Atual</p>
                <p className="text-3xl font-bold text-white">R$ 1.847,32</p>
                <span
                  className="text-xs font-semibold mt-2 inline-block px-2.5 py-1 rounded-full"
                  style={{ background: '#6CF8BB', color: '#00714D' }}
                >
                  +12,4% este mês
                </span>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 p-4" style={{ background: '#F3F4F5' }}>
                <div className="bg-white p-3 rounded-xl border" style={{ borderColor: '#E1E3E4' }}>
                  <p className="text-xs" style={{ color: '#707978' }}>Receitas</p>
                  <p className="text-base font-bold" style={{ color: '#006C49' }}>R$ 5.200</p>
                </div>
                <div className="bg-white p-3 rounded-xl border" style={{ borderColor: '#E1E3E4' }}>
                  <p className="text-xs" style={{ color: '#707978' }}>Despesas</p>
                  <p className="text-base font-bold" style={{ color: '#BA1A1A' }}>R$ 3.352</p>
                </div>
              </div>
              {/* Transactions */}
              <div className="px-4 pb-4 space-y-2">
                {[
                  { icon: 'directions_car', name: 'Uber', val: '-R$ 55,00', col: '#BA1A1A' },
                  { icon: 'restaurant', name: 'Almoço', val: '-R$ 32,00', col: '#BA1A1A' },
                  { icon: 'payments', name: 'Salário', val: '+R$ 5.200', col: '#006C49' },
                ].map((t) => (
                  <div key={t.name} className="flex items-center gap-3 bg-white p-3 rounded-xl border" style={{ borderColor: '#E1E3E4' }}>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#B4EDEC' }}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ color: '#003535', pointerEvents: 'none', fontSize: '16px' }}>
                        {t.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: '#191C1D' }}>{t.name}</span>
                    <span className="text-sm font-bold" style={{ color: t.col }}>{t.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Float card */}
          <div
            className="absolute bottom-6 -left-4 hidden sm:flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
            style={{ background: '#FFFFFF', boxShadow: '0 12px 32px rgba(0,53,53,0.16)', maxWidth: '200px' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#B4EDEC' }}
            >
              <span className="material-symbols-outlined text-base" style={{ color: '#003535', pointerEvents: 'none', fontSize: '18px' }}>
                chat_bubble
              </span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold" style={{ color: '#191C1D' }}>"gasto uber 55"</p>
              <p className="text-[10px]" style={{ color: '#707978' }}>registrado em 1 segundo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const features = [
  {
    icon: 'receipt_long',
    title: 'Lançamentos em segundos',
    text: 'Registre despesas, receitas e entradas com valor, categoria, descrição e data. Rápido no celular e no computador.',
  },
  {
    icon: 'donut_large',
    title: 'Gastos por categoria',
    text: 'Um gráfico claro mostra para onde vai o seu dinheiro todo mês. Descubra os vilões do orçamento em um olhar.',
  },
  {
    icon: 'trending_up',
    title: 'Evolução mensal',
    text: 'Acompanhe seu saldo e a evolução dos gastos ao longo dos meses e veja seu progresso financeiro crescer.',
  },
  {
    icon: 'smart_toy',
    title: 'Bot no Telegram',
    text: 'Vincule sua conta e lance gastos por mensagem, tipo "gasto uber 55". O bot confirma e organiza tudo pra você.',
  },
  {
    icon: 'shield',
    title: 'Seus dados protegidos',
    text: 'Senhas com criptografia forte, dados sensíveis protegidos e controle total: exporte ou apague seus dados quando quiser.',
  },
  {
    icon: 'calendar_clock',
    title: 'Lembretes de contas',
    text: 'Programe contas recorrentes e receba avisos antes do vencimento para nunca mais pagar juros por esquecimento.',
    soon: true,
  },
];

function Features() {
  return (
    <section id="recursos" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5 flex flex-col gap-12">
        <SectionHeading
          eyebrow="Tudo em um só lugar"
          title="Suas finanças organizadas, sem complicação"
          subtitle="Ferramentas simples e poderosas para você entender, controlar e fazer seu dinheiro render mais."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <article
              key={f.title}
              className="flex flex-col gap-3 p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1"
              style={{
                background: '#F8F9FA',
                borderColor: '#E1E3E4',
                boxShadow: '0 4px 12px rgba(13,77,77,0.05)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: '#B4EDEC' }}
              >
                <span className="material-symbols-outlined" style={{ color: '#003535', pointerEvents: 'none' }}>
                  {f.icon}
                </span>
              </div>
              <h3 className="text-base font-semibold" style={{ color: '#191C1D' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#404848' }}>
                {f.text}
              </p>
              {f.soon && (
                <span
                  className="self-start text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: '#E3F7EE', color: '#006C49' }}
                >
                  Em breve
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Telegram Section ─── */
function TelegramSection() {
  return (
    <section
      id="telegram"
      className="py-20"
      style={{ background: '#F8F9FA' }}
    >
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Telegram mockup */}
        <div className="flex justify-center order-2 md:order-1">
          <TelegramChatSimulation />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-6 order-1 md:order-2">
          <SectionHeading
            eyebrow="Bot do Telegram"
            title="Lance gastos sem abrir o app"
            subtitle="Vincule sua conta ao bot e registre transações por mensagem. Em qualquer lugar, a qualquer hora — é só digitar."
          />
          <ul className="flex flex-col gap-3">
            {[
              '"gasto uber 55" → despesa registrada',
              '"receita salário 5200" → receita salva',
              '"saldo" → veja seu saldo atual',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#404848' }}>
                <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5" style={{ color: '#006C49', pointerEvents: 'none' }}>
                  check_circle
                </span>
                <code className="text-sm bg-white px-2 py-0.5 rounded border border-zinc-200" style={{ color: '#003535' }}>{item}</code>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white self-start transition-all hover:opacity-90 active:scale-95 shadow-md"
            style={{ background: '#003535' }}
          >
            Conectar meu Telegram
            <span className="material-symbols-outlined text-lg" style={{ pointerEvents: 'none', fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
const steps = [
  { num: '1', title: 'Crie sua conta grátis', text: 'Cadastre-se com seu e-mail em menos de 2 minutos. Sem cartão de crédito, sem burocracia.' },
  { num: '2', title: 'Registre suas transações', text: 'Adicione gastos e receitas pelo app ou mande uma mensagem para o bot no Telegram.' },
  { num: '3', title: 'Acompanhe e economize', text: 'Veja seu saldo, os gráficos por categoria e a evolução do mês. Tome decisões melhores com clareza.' },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5 flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Simples do início ao fim"
          title="Comece a economizar em 3 passos"
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: 'linear-gradient(140deg, #003535, #0D4D4D)' }}
              >
                {s.num}
              </div>
              <h3 className="text-base font-semibold" style={{ color: '#191C1D' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#404848' }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');

  const priceData = {
    monthly: { price: '14,99', period: '/ mês', totalNote: 'Cobrado R$ 14,99 por mês', badge: '' },
    quarterly: { price: '12,74', period: '/ mês', totalNote: 'Cobrado R$ 38,22 a cada 3 meses', badge: 'Economize 15%' },
    annual: { price: '9,74', period: '/ mês', totalNote: 'Cobrado R$ 116,90 por ano (Economize R$ 63,00!)', badge: '🔥 MAIS POPULAR (-35% OFF)' },
  };

  const currentPrice = priceData[cycle];

  const proFeaturesList = [
    'Bot no Telegram com IA que entende áudios e texto livre',
    'Gestão completa de cartão de crédito e parcelamentos (1x a 24x)',
    'Alertas automáticos de meta e projeção de faturas',
    'Relatórios detalhados e gráficos por categoria ilimitados',
    'Lembretes de contas a pagar para evitar juros e multas',
    'Exportação ilimitada de dados (JSON/Excel)',
    'Prioridade no lançamento do Open Finance (conexão bancária)',
  ];

  return (
    <section id="planos" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Invista no seu futuro"
          title="Coloque suas finanças no piloto automático"
          subtitle="Escolha o plano ideal. Pague menos de R$ 0,33 por dia para economizar centenas de reais todos os meses."
          center
        />

        {/* ── Billing Cycle Toggler ── */}
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1 max-w-md w-full">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              cycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensal
          </button>

          <button
            type="button"
            onClick={() => setCycle('quarterly')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              cycle === 'quarterly'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Trimestral</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold">-15%</span>
          </button>

          <button
            type="button"
            onClick={() => setCycle('annual')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              cycle === 'annual'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 font-extrabold hover:text-slate-900'
            }`}
          >
            <span>Anual</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold">-35% OFF</span>
          </button>
        </div>

        {/* ── Pricing Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
          {/* Free Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Plano Free</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  Gratuito para Sempre
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">R$ 0</span>
                <span className="text-sm font-semibold text-slate-500">/mês</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tudo que você precisa para começar a organizar suas finanças diárias.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  'Transações ilimitadas no app',
                  'Dashboard financeiro com saldo',
                  'Bot do Telegram com comandos simples',
                  'Filtros por categoria e gráficos',
                  'Exportação em formato JSON (LGPD)',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/register"
              className="w-full text-center text-xs font-bold py-3.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Pro Card (Persuasive Glow Card) */}
          <div className="relative bg-gradient-to-br from-[#003535] via-[#042626] to-[#001f1f] text-white p-8 rounded-3xl shadow-2xl border-2 border-emerald-400/40 flex flex-col justify-between space-y-6 overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  Plano PRO
                  <span className="material-symbols-outlined text-amber-400 text-lg">auto_awesome</span>
                </h3>
                {currentPrice.badge && (
                  <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider shadow-sm">
                    {currentPrice.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-300 font-bold">R$</span>
                  <span className="text-4xl font-black text-white">{currentPrice.price}</span>
                  <span className="text-xs text-emerald-300 font-bold">{currentPrice.period}</span>
                </div>
                <p className="text-[11px] text-emerald-200 font-medium">{currentPrice.totalNote}</p>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Piloto automático com Inteligência Artificial no Telegram, parcelamentos e lembretes para economizar de verdade.
              </p>

              <ul className="space-y-3 pt-2">
                {proFeaturesList.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs font-semibold text-slate-100">
                    <span className="material-symbols-outlined text-emerald-400 text-base flex-shrink-0 mt-0.5">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 relative z-10 pt-2">
              <Link
                href="/register"
                className="block w-full text-center text-xs font-black py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Garantir Plano PRO com Desconto
              </Link>
              <p className="text-[10px] text-center text-slate-300 font-medium">
                🛡️ 7 dias de garantia incondicional de satisfação
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  { q: 'O Economize Já é realmente grátis?', a: 'Sim. O plano Free é gratuito para sempre e inclui transações ilimitadas, dashboard completo e o bot do Telegram com comandos simples. Você só migra para o Pro se quiser recursos avançados como a IA e lembretes.' },
  { q: 'Preciso informar dados do meu banco?', a: 'Não. Você registra suas transações manualmente ou pelo Telegram. A conexão automática com bancos (Open Finance) chegará no futuro como recurso Pro, sempre por meio de um agregador certificado e com a sua autorização.' },
  { q: 'Como funciona o bot do Telegram?', a: 'Você gera um código de vínculo dentro do app e envia para o bot no Telegram. A partir daí, é só mandar mensagens como "gasto uber 55" que o bot registra e confirma o lançamento na hora.' },
  { q: 'Meus dados financeiros estão seguros?', a: 'Sim. Usamos criptografia forte para senhas e dados sensíveis, conexões seguras (HTTPS) e registros de auditoria em ações críticas. Você também pode exportar ou apagar todos os seus dados quando quiser.' },
  { q: 'Funciona no computador ou só no celular?', a: 'O Economize Já é pensado para o celular (mobile-first), mas funciona muito bem também no notebook e no desktop — seus dados ficam sincronizados em qualquer dispositivo.' },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-5 flex flex-col items-center gap-8">
        <SectionHeading eyebrow="Dúvidas frequentes" title="Tudo o que você precisa saber" center />
        <div className="w-full flex flex-col gap-2">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: '#E1E3E4', background: '#FFFFFF' }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold" style={{ color: '#191C1D' }}>{item.q}</span>
                <span
                  className="material-symbols-outlined text-xl flex-shrink-0 ml-3 transition-transform"
                  style={{
                    color: '#003535',
                    pointerEvents: 'none',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  expand_more
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#404848' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCta() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div
          className="relative overflow-hidden rounded-3xl flex flex-col items-center text-center gap-6 py-16 px-6"
          style={{ background: 'linear-gradient(150deg, #003535, #04211F)' }}
        >
          {/* Glow */}
          <div
            className="absolute -top-36 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(108,248,187,0.20), transparent 66%)' }}
          />
          <h2
            className="relative text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl"
            style={{ textWrap: 'balance' } as any}
          >
            Seu dinheiro sob controle começa hoje
          </h2>
          <p className="relative text-base md:text-lg max-w-lg" style={{ color: '#DDECEB' }}>
            Junte-se a quem já parou de se perder com os gastos. Crie sua conta grátis e veja a diferença já no primeiro mês.
          </p>
          <Link
            href="/register"
            className="relative inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#006C49' }}
          >
            Criar minha conta grátis
            <span className="material-symbols-outlined text-lg" style={{ pointerEvents: 'none', fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
          <div className="relative flex flex-wrap justify-center gap-6 text-xs" style={{ color: '#DDECEB' }}>
            {['Grátis para começar', 'Sem cartão de crédito', 'Cancele quando quiser'].map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" style={{ color: '#6CF8BB', pointerEvents: 'none', fontSize: '14px' }}>
                  check_circle
                </span>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function SiteFooter() {
  const productLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#telegram', label: 'Bot do Telegram' },
    { href: '#planos', label: 'Planos' },
    { href: '#faq', label: 'Dúvidas' },
  ];
  const legalLinks = [
    { href: '/privacidade', label: 'Privacidade & LGPD' },
    { href: '/register', label: 'Criar conta' },
    { href: '/login', label: 'Entrar na Conta' },
  ];

  return (
    <footer
      className="pt-14 pb-8"
      style={{ background: 'linear-gradient(180deg, #04211F, #003535)' }}
    >
      <div className="max-w-6xl mx-auto px-5 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-2 font-black text-white text-lg">
              <div className="w-9 h-9 rounded-xl bg-white/10 p-0.5 border border-white/20 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Economize Já Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              Economize Já
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#DDECEB' }}>
              Controle suas finanças pelo celular e pelo Telegram. Simples, seguro e feito para o seu dia a dia.
            </p>
          </div>

          {/* Product */}
          <nav className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#98D1D0' }}>Produto</span>
            {productLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs transition-colors hover:text-white" style={{ color: '#DDECEB' }}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* Legal & Account */}
          <nav className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#98D1D0' }}>Segurança & Legal</span>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs transition-colors hover:text-white" style={{ color: '#DDECEB' }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#98D1D0' }}>Contato & Suporte</span>
            <p className="text-xs" style={{ color: '#DDECEB' }}>
              Fale conosco para dúvidas, suporte ou requisições de dados:
            </p>
            <a
              href="mailto:onboarding.economizeja@gmail.com"
              className="text-xs font-bold text-emerald-300 hover:underline flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              onboarding.economizeja@gmail.com
            </a>
          </div>
        </div>

        <div
          className="flex flex-wrap justify-between gap-4 pt-6 border-t text-xs"
          style={{ borderColor: 'rgba(180,237,236,0.16)', color: '#98D1D0' }}
        >
          <span>© {new Date().getFullYear()} Economize Já. Todos os direitos reservados.</span>
          <Link href="/privacidade" className="hover:underline">
            Política de Privacidade & LGPD
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div style={{ background: '#F8F9FA', color: '#191C1D' }}>
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
  );
}
