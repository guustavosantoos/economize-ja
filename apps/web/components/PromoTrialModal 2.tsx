'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../lib/api-client';

export default function PromoTrialModal() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.plan === 'pro') return;

    const storageKey = `economizeja_promo_7days_seen_${user.id}`;
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      // Exibir modal 1x se for plano Free e ainda não tiver clicado em "ver depois" ou "aproveitar"
      setOpen(true);
    }
  }, [user]);

  const handleDismiss = () => {
    if (user?.id) {
      const storageKey = `economizeja_promo_7days_seen_${user.id}`;
      localStorage.setItem(storageKey, 'true');
    }
    setOpen(false);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if (user.id) {
        const storageKey = `economizeja_promo_7days_seen_${user.id}`;
        localStorage.setItem(storageKey, 'true');
      }

      // Redirecionar para o Checkout da Stripe com 7 dias de trial configurados
      const res: any = await apiClient.post('/payments/checkout-session', {
        cycle: 'monthly',
        trialDays: 7,
      });

      if (res && res.url) {
        window.location.href = res.url;
      } else {
        setError('Não foi possível iniciar a sessão de pagamento. Tente novamente.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao conectar com o serviço de pagamentos.');
      setLoading(false);
    }
  };

  if (!open || !user || user.plan === 'pro') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden transition-all text-slate-900 dark:text-white">
        {/* Glow de Destaque no Topo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar (X) */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Conteúdo Principal */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">redeem</span>
            <span>Presente Exclusivo</span>
          </div>

          {/* Título & Chamada */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              Parabéns! Você ganhou 7 dias grátis do nosso Plano PRO 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-medium">
              Experimente o controle financeiro absoluto sem pagar nada hoje. Teste todas as ferramentas avançadas por 7 dias inteiros!
            </p>
          </div>

          {/* Pontos Positivos do Plano PRO */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Vantagens Exclusivas Liberadas:
            </h3>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0 mt-0.5">smart_toy</span>
                <span><strong>Bot no Telegram com IA:</strong> Registre gastos por mensagem de voz ou texto livre.</span>
              </li>
              <li className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0 mt-0.5">credit_card</span>
                <span><strong>Gestão de Cartão & Parcelamentos:</strong> Limites, faturas e compras em até 24x.</span>
              </li>
              <li className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0 mt-0.5">alarm</span>
                <span><strong>Lembretes de Contas a Pagar:</strong> Avisos de vencimento para nunca mais pagar juros.</span>
              </li>
              <li className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0 mt-0.5">analytics</span>
                <span><strong>Relatórios & Exportação Ilimitada:</strong> Baixe seus dados em Excel ou JSON quando quiser.</span>
              </li>
            </ul>
          </div>

          {/* Caixa de Garantia Sem Risco */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-xl text-center">
            <p className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              🛡️ <strong>R$ 0,00 cobrados hoje.</strong> Se não gostar, cancele antes de 7 dias e nada será cobrado no seu cartão!
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 text-center"
            >
              Ver depois
            </button>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full sm:w-2/3 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Redirecionando...</span>
                </>
              ) : (
                <>
                  <span>🚀 Aproveitar 7 Dias Grátis</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
