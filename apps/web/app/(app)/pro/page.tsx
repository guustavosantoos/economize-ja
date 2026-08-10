'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';

export default function ProPage() {
  const { user } = useAuthStore();
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [subscribing, setSubscribing] = useState(false);

  const priceData = {
    monthly: { price: '14,99', period: '/ mês', totalNote: 'Cobrado R$ 14,99 mensalmente', badge: '' },
    quarterly: { price: '12,74', period: '/ mês', totalNote: 'Cobrado R$ 38,22 a cada 3 meses', badge: 'Desconto de 15%' },
    annual: { price: '9,74', period: '/ mês', totalNote: 'Cobrado R$ 116,90 por ano (Economize R$ 63,00!)', badge: '🔥 MAIS POPULAR (-35% OFF)' },
  };

  const currentPrice = priceData[cycle];
  const isPro = user?.plan === 'pro';

  const handleSubscribe = () => {
    setSubscribing(true);
    // Simulação ou redirecionamento para o gateway de pagamento
    setTimeout(() => {
      alert(`Obrigado por escolher o Plano PRO (${cycle.toUpperCase()})! Em breve a integração com o checkout transparente estará disponível.`);
      setSubscribing(false);
    }, 500);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-28 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">workspace_premium</span>
          Economize Já PRO
        </div>
        <h1 data-cy="pro-page-title" className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Transforme suas finanças com Inteligência Artificial
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Pague menos de R$ 0,33 por dia e tenha controle total dos seus gastos pelo Telegram, parcelamentos automáticos e lembretes de contas.
        </p>
      </div>

      {/* ── Billing Cycle Toggler ── */}
      <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setCycle('monthly')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
            cycle === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Mensal
        </button>

        <button
          type="button"
          onClick={() => setCycle('quarterly')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
            cycle === 'quarterly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
              : 'text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <span>Anual</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold">-35% OFF</span>
        </button>
      </div>

      {/* ── Main Pro Card ── */}
      <div className="relative bg-gradient-to-br from-[#003535] via-[#042626] to-[#001f1f] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-emerald-400/40 space-y-6 overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">auto_awesome</span>
            <h2 className="text-xl font-black text-white">Plano PRO</h2>
          </div>
          {currentPrice.badge && (
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider shadow-sm">
              {currentPrice.badge}
            </span>
          )}
        </div>

        {/* Price Display */}
        <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-300 font-bold">R$</span>
            <span className="text-4xl font-black text-white">{currentPrice.price}</span>
            <span className="text-xs text-emerald-300 font-bold">{currentPrice.period}</span>
          </div>
          <p className="text-xs text-emerald-200 font-medium">{currentPrice.totalNote}</p>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Tudo que você recebe no PRO:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold">
            <div data-cy="pro-feature-ai" className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg">smart_toy</span>
              <span>Bot no Telegram com IA & Voz</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg">credit_card</span>
              <span>Compras Parceladas até 24x</span>
            </div>
            <div data-cy="pro-feature-bills" className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg">receipt_long</span>
              <span>Lembretes de Contas a Pagar</span>
            </div>
            <div data-cy="pro-feature-openfinance" className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg">account_balance</span>
              <span>Conexão Open Finance (Prioridade)</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-3 pt-2">
          {isPro ? (
            <div className="w-full text-center py-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-xs">
              ✓ Você já é um assinante PRO! Aproveite todos os recursos.
            </div>
          ) : (
            <button
              data-cy="pro-upgrade-button"
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full text-center text-xs font-black py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {subscribing ? 'Processando...' : `Assinar Agora por R$ ${currentPrice.price} ${currentPrice.period}`}
            </button>
          )}

          <p className="text-[11px] text-center text-slate-300 font-medium flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-400">verified</span>
            Garantia Incondicional de 7 Dias • Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
}
