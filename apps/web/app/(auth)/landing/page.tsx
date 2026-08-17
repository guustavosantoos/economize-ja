import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '../../../components/SiteHeader';
import LandingFaq from '../../../components/LandingFaq';
import TelegramChatWrapper from '../../../components/TelegramChatWrapper';
import LandingPricing from '../../../components/LandingPricing';

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



/* ─── Hero ─── */
function Hero() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden bg-slate-50 dark:bg-[#0b0f17] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full self-start bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <span className="material-symbols-outlined text-base">chat_bubble</span>
            Novo: lance gastos direto no Telegram
          </span>

          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            Assuma o controle do seu dinheiro{' '}
            <span className="text-emerald-600 dark:text-emerald-400">sem planilhas</span>
          </h1>

          <p className="text-base md:text-lg leading-relaxed max-w-lg text-slate-600 dark:text-slate-300">
            O Economize Já organiza suas despesas e receitas em segundos. Veja para onde vai cada real, acompanhe seu
            saldo em tempo real e registre gastos por mensagem — de qualquer lugar, pelo celular.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Criar minha conta grátis
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Reassurances */}
          <div className="flex flex-wrap gap-5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            {['Grátis para começar', 'Sem cartão de crédito', 'Pronto em 2 minutos'].map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">
                  check_circle
                </span>
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Visual — App mockup */}
        <div className="relative flex justify-center items-center">
          <div className="w-full max-w-xs rounded-3xl p-1.5 shadow-2xl bg-gradient-to-br from-emerald-700 via-slate-900 to-slate-950 border border-slate-800">
            <div className="bg-slate-900 rounded-[22px] overflow-hidden shadow-2xl border border-slate-800">
              {/* Status bar */}
              <div className="h-8 flex items-center justify-center bg-[#003535]">
                <span className="text-white text-xs font-extrabold tracking-wide">Economize Já</span>
              </div>
              {/* Balance card */}
              <div className="p-4 bg-[#003535] text-white">
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">Saldo Atual</p>
                <p className="text-3xl font-black text-white">R$ 1.847,32</p>
                <span className="text-xs font-extrabold mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  +12,4% este mês
                </span>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">Receitas</p>
                  <p className="text-sm font-extrabold text-emerald-400">R$ 5.200</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">Despesas</p>
                  <p className="text-sm font-extrabold text-rose-400">R$ 3.352</p>
                </div>
              </div>
              {/* Transactions */}
              <div className="px-3 pb-4 space-y-2 bg-slate-950">
                {[
                  { icon: 'directions_car', name: 'Uber', val: '-R$ 55,00', col: 'text-rose-400' },
                  { icon: 'restaurant', name: 'Almoço', val: '-R$ 32,00', col: 'text-rose-400' },
                  { icon: 'payments', name: 'Salário', val: '+R$ 5.200', col: 'text-emerald-400' },
                ].map((t) => (
                  <div key={t.name} className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <span className="material-symbols-outlined text-base">{t.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-white flex-1">{t.name}</span>
                    <span className={`text-xs font-black ${t.col}`}>{t.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Float card */}
          <div className="absolute bottom-6 -left-4 hidden sm:flex items-center gap-3 rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-[210px]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-900 dark:text-white">"gasto uber 55"</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">registrado em 1 segundo</p>
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
    <section id="recursos" className="py-20 bg-white dark:bg-[#111827] transition-colors">
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
              className="flex flex-col gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-1 shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/40">
                <span className="material-symbols-outlined text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {f.text}
              </p>
              {f.soon && (
                <span className="self-start text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
    <section id="telegram" className="py-20 bg-slate-50 dark:bg-[#0b0f17] transition-colors">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Telegram mockup */}
        <div className="flex justify-center order-2 md:order-1">
          <TelegramChatWrapper />
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
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">
                  check_circle
                </span>
                <code className="text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-bold">
                  {item}
                </code>
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 self-start transition-all hover:scale-[1.02] active:scale-95"
          >
            Conectar meu Telegram
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
    <section id="como-funciona" className="py-20 bg-white dark:bg-[#111827] transition-colors">
      <div className="max-w-6xl mx-auto px-5 flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Simples do início ao fim"
          title="Comece a economizar em 3 passos"
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                {s.num}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  return (
    <section id="planos" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Invista no seu futuro"
          title="Coloque suas finanças no piloto automático"
          subtitle="Escolha o plano ideal. Pague menos de R$ 0,33 por dia para economizar centenas de reais todos os meses."
          center
        />
        <LandingPricing />
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function Faq() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-5 flex flex-col items-center gap-8">
        <SectionHeading eyebrow="Dúvidas frequentes" title="Tudo o que você precisa saber" center />
        <LandingFaq />
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
