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
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#006C49' }}>
        {eyebrow}
      </span>
      <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight" style={{ color: '#003535' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg leading-relaxed" style={{ color: '#404848' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Header ─── */
function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#telegram', label: 'Telegram' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#planos', label: 'Planos' },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(248,249,250,0.85)',
        backdropFilter: 'saturate(180%) blur(12px)',
        borderColor: '#E1E3E4',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <a href="#topo" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#003535' }}>
          <Image
            src="/logo.png"
            alt="Economize Já Logo"
            width={56}
            height={56}
            className="rounded-2xl object-contain w-14 h-14 border border-surface-variant bg-white p-1"
          />
          Economize Já
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-primary"
              style={{ color: '#404848' }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-9 h-9 rounded-xl bg-surface-container dark:bg-[#151d27] border border-surface-variant dark:border-[#253346] flex items-center justify-center text-amber-500 hover:scale-105 transition-all shadow-xs"
            title="Alternar Tema (Claro / Escuro)"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-surface-container"
            style={{ color: '#404848' }}
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#003535' }}
          >
            Criar conta grátis
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-xl" style={{ color: '#003535', pointerEvents: 'none' }}>
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-3" style={{ borderColor: '#E1E3E4', background: '#F8F9FA' }}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium py-2"
              style={{ color: '#404848' }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
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
const freeFeatures = [
  'Transações ilimitadas (gastos e receitas)',
  'Dashboard com saldo e gráficos',
  'Gastos por categoria e evolução mensal',
  'Bot do Telegram com comandos simples',
  'Exportação e exclusão dos seus dados',
];
const proFeatures = [
  'Tudo do plano Free, e mais:',
  'IA no Telegram que entende frases livres',
  'Lembretes de contas com recorrência',
  'WhatsApp (em breve)',
  'Open Finance — conexão com bancos (em breve)',
];

function Pricing() {
  return (
    <section id="planos" className="py-20" style={{ background: '#F8F9FA' }}>
      <div className="max-w-6xl mx-auto px-5 flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Planos"
          title="Comece de graça, evolua quando quiser"
          subtitle="O plano Free já resolve o seu dia a dia. O Pro chega para quem quer piloto automático nas finanças."
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Free */}
          <div
            className="flex flex-col gap-5 p-7 rounded-2xl border"
            style={{ background: '#FFFFFF', borderColor: '#E1E3E4', boxShadow: '0 4px 12px rgba(13,77,77,0.05)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: '#003535' }}>Free</h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: '#E3F7EE', color: '#006C49' }}
              >
                Para sempre
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: '#191C1D' }}>R$ 0</span>
              <span className="text-sm" style={{ color: '#707978' }}>/mês</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#404848' }}>
              Tudo que você precisa para organizar suas finanças e criar o hábito.
            </p>
            <ul className="flex flex-col gap-2.5 flex-1">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#404848' }}>
                  <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" style={{ color: '#006C49', pointerEvents: 'none', fontSize: '16px' }}>
                    check
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full text-center text-sm font-semibold py-3 rounded-xl border-2 transition-all hover:bg-surface-container active:scale-95"
              style={{ borderColor: '#003535', color: '#003535' }}
            >
              Criar conta grátis
            </Link>
          </div>

          {/* Pro */}
          <div
            className="flex flex-col gap-5 p-7 rounded-2xl"
            style={{
              background: 'linear-gradient(160deg, #003535, #04211F)',
              boxShadow: '0 22px 48px rgba(0,53,53,0.28)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                style={{ background: '#6CF8BB', color: '#003535' }}
              >
                <span className="material-symbols-outlined text-xs" style={{ pointerEvents: 'none', fontSize: '12px' }}>
                  auto_awesome
                </span>
                Recomendado
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">Em breve</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#DDECEB' }}>
              Automação com IA e recursos avançados para quem leva o controle a sério.
            </p>
            <ul className="flex flex-col gap-2.5 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#DDECEB' }}>
                  <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" style={{ color: '#6CF8BB', pointerEvents: 'none', fontSize: '16px' }}>
                    check
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full text-center text-sm font-semibold py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#006C49' }}
            >
              Começar no Free
            </Link>
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
  const accountLinks = [
    { href: '/register', label: 'Criar conta' },
    { href: '/login', label: 'Entrar' },
  ];

  return (
    <footer
      className="pt-14 pb-8"
      style={{ background: 'linear-gradient(180deg, #04211F, #003535)' }}
    >
      <div className="max-w-6xl mx-auto px-5 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <Image
                src="/logo.png"
                alt="Economize Já Logo"
                width={56}
                height={56}
                className="rounded-2xl object-contain bg-white p-1 w-14 h-14 border border-surface-variant"
              />
              Economize Já
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#DDECEB' }}>
              Controle suas finanças pelo celular e pelo Telegram. Simples, seguro e feito para o seu dia a dia.
            </p>
          </div>

          {/* Product */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#98D1D0' }}>Produto</span>
            {productLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: '#DDECEB' }}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* Account */}
          <nav className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#98D1D0' }}>Conta</span>
            {accountLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: '#DDECEB' }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="flex flex-wrap justify-between gap-4 pt-6 border-t text-xs"
          style={{ borderColor: 'rgba(180,237,236,0.16)', color: '#98D1D0' }}
        >
          <span>© {new Date().getFullYear()} Economize Já. Todos os direitos reservados.</span>
          <span>Feito para quem quer economizar de verdade.</span>
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
