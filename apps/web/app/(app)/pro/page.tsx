'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';

import { apiClient } from '../../../lib/api-client';

export default function ProPage() {
  const { user } = useAuthStore();
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [subscribing, setSubscribing] = useState(false);

  const priceData = {
    monthly: { price: '14,99', period: '/ mês', totalNote: 'Cobrado R$ 14,99 mensalmente', badge: '' },
    quarterly: { price: '12,74', period: '/ mês', totalNote: 'Cobrado R$ 38,22 a cada 3 meses', badge: '15% OFF' },
    annual: { price: '9,74', period: '/ mês', totalNote: 'Cobrado R$ 116,90 por ano (Economize R$ 63,00!)', badge: '🔥 MAIS POPULAR' },
  };

  const currentPrice = priceData[cycle];
  const isPro = user?.plan === 'pro';

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res: any = await apiClient.post('/payments/checkout-session', { cycle });
      if (res?.url) {
        window.location.href = res.url;
      } else {
        alert('Erro ao redirecionar para o Checkout Stripe.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao conectar ao Checkout Stripe.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-28 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">workspace_premium</span>
          Economize Já PRO
        </div>
        <h1 data-cy="pro-page-title" className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Transforme suas finanças com Inteligência Artificial
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Pague menos de R$ 0,33 por dia e tenha controle total dos seus gastos pelo Telegram, parcelamentos automáticos e lembretes de contas.
        </p>
      </div>

      {/* ── Billing Cycle Toggler ── */}
      <div className="bg-slate-200/90 dark:bg-slate-800/90 p-1.5 rounded-2xl flex items-center justify-between gap-1 max-w-md mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setCycle('monthly')}
          className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all text-center ${
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
          className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 text-center ${
            cycle === 'quarterly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Trimestral</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1 py-0.5 rounded font-extrabold">-15%</span>
        </button>

        <button
          type="button"
          onClick={() => setCycle('annual')}
          className={`flex-1 py-2.5 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 text-center ${
            cycle === 'annual'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <span>Anual</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] px-1 py-0.5 rounded font-extrabold">-35%</span>
        </button>
      </div>

      {/* ── Main Pro Card ── */}
      <div className="relative bg-gradient-to-br from-[#003535] via-[#042626] to-[#001f1f] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-emerald-400/40 space-y-6 overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header (Fixed for small screens) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">auto_awesome</span>
            <h2 className="text-xl font-black text-white">Plano PRO</h2>
          </div>
          {currentPrice.badge && (
            <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider shadow-xs whitespace-nowrap">
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
        <div className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Tudo que você recebe no PRO:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
            <div data-cy="pro-feature-ai" className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">smart_toy</span>
              <span>Bot no Telegram com IA & Voz</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">credit_card</span>
              <span>Compras Parceladas até 24x</span>
            </div>
            <div data-cy="pro-feature-bills" className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">receipt_long</span>
              <span>Lembretes de Contas a Pagar</span>
            </div>
            <div data-cy="pro-feature-openfinance" className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">account_balance</span>
              <span>Conexão Open Finance (Prioridade)</span>
            </div>
          </div>
        </div>

        {/* CTA Button / Pro Subscriber Card */}
        <div className="space-y-3 pt-2">
          {isPro ? (
            <div className="w-full text-center py-3.5 px-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 font-bold text-xs sm:text-sm leading-relaxed flex items-center justify-center gap-2 shadow-inner">
              <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">workspace_premium</span>
              <span>Você já é um assinante <strong>PRO</strong>! Todos os recursos estão liberados.</span>
            </div>
          ) : (
            <button
              data-cy="pro-upgrade-button"
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full text-center text-xs sm:text-sm font-black py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {subscribing ? 'Processando...' : `Assinar Agora por R$ ${currentPrice.price} ${currentPrice.period}`}
            </button>
          )}

          <p className="text-[11px] text-center text-slate-300 font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <span className="material-symbols-outlined text-sm text-emerald-400 flex-shrink-0">verified</span>
            <span>Garantia Incondicional de 7 Dias • Cancele quando quiser</span>
          </p>
        </div>
      </div>
    </div>
  );
}
