'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPricing() {
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
    <div className="w-full flex flex-col items-center gap-8">
      {/* Toggle de Ciclo de Cobrança */}
      <div className="bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300/50 shadow-inner">
        {(['monthly', 'quarterly', 'annual'] as const).map((c) => {
          const labels = {
            monthly: 'Mensal',
            quarterly: 'Trimestral (-15%)',
            annual: 'Anual (-35%)',
          };
          const isActive = cycle === c;

          return (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50'
              }`}
            >
              {labels[c]}
            </button>
          );
        })}
      </div>

      {/* Grid de Cards de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* PLANO FREE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Comece sem custos</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Plano Gratuito</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Ideal para organizar o dia a dia e controlar entradas e saídas básicas.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
              <span className="text-sm text-slate-500 font-semibold">/ para sempre</span>
            </div>

            <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {[
                'Lançamento ilimitado de receitas e despesas',
                'Dashboard financeiro completo com mapa de calor',
                'Bot do Telegram com comandos simples',
                'Categorias de gastos pré-definidas',
                'Exportação de dados simples',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0">check_circle</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/register"
            className="mt-8 block w-full text-center text-xs font-extrabold py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Criar conta grátis
          </Link>
        </div>

        {/* PLANO PRO */}
        <div className="relative bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl ring-2 ring-emerald-500 overflow-hidden">
          {/* Tag de Destaque */}
          {currentPrice.badge && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              {currentPrice.badge}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Recursos Exclusivos</span>
              <h3 className="text-2xl font-black text-white mt-1">Plano PRO 🔥</h3>
              <p className="text-sm text-slate-300 mt-2">
                Para quem quer controle absoluto, inteligência artificial no Telegram e automação completa.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <span className="text-5xl font-black text-white">{currentPrice.price}</span>
                <span className="text-sm text-slate-400 font-semibold">{currentPrice.period}</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">{currentPrice.totalNote}</p>
            </div>

            <ul className="space-y-3 pt-4 border-t border-slate-800">
              {proFeaturesList.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0">stars</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 relative z-10 pt-8">
            <Link
              href="/register"
              className="block w-full text-center text-xs font-black py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Garantir Plano PRO com Desconto
            </Link>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              🛡️ 7 dias de garantia incondicional de satisfação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
