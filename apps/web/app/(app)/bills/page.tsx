'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api-client';

type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  recurrence: string;
  nextDueDate: string;
  status: 'overdue' | 'today' | 'pending' | 'paid';
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
};

type PaidHistory = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

export default function BillsPage() {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [bills, setBills] = useState<Bill[]>([]);
  const [history, setHistory] = useState<PaidHistory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Novo Lembrete
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [recurrence, setRecurrence] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBills = async () => {
    if (!isPro) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiClient.get('/bills');
      if (Array.isArray(data)) setBills(data);
    } catch {
      // Ignorar se erro
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!isPro) return;
    try {
      // Busca transações de pagamento de contas
      const data = await apiClient.get('/transactions?limit=20');
      if (data && Array.isArray(data.items)) {
        const paidTxs = data.items.filter((t: any) => t.description && t.description.startsWith('Pagamento:'));
        setHistory(paidTxs);
      }
    } catch {
      // Ignorar se erro
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.get('/categories');
      if (Array.isArray(data)) setCategories(data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadBills();
    loadHistory();
    loadCategories();
  }, [user]);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (!name.trim() || isNaN(cleanAmount) || cleanAmount <= 0) return;

    setSaving(true);
    try {
      await apiClient.post('/bills', {
        name: name.trim(),
        amount: cleanAmount,
        dueDay: parseInt(dueDay, 10) || 10,
        recurrence,
        nextDueDate,
        categoryId: categoryId || undefined,
      });

      setShowModal(false);
      setName('');
      setAmount('');
      triggerToast('✓ Lembrete de conta cadastrado com sucesso!');
      await loadBills();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar lembrete.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayBill = async (bill: Bill) => {
    try {
      await apiClient.post(`/bills/${bill.id}/pay`);
      triggerToast(`✓ Conta "${bill.name}" marcada como PAGA! Lançada no histórico.`);
      await loadBills();
      await loadHistory();
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar conta como paga.');
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Deseja remover este lembrete?')) return;
    try {
      await apiClient.del(`/bills/${id}`);
      triggerToast('Lembrete removido.');
      await loadBills();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover conta.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Se o Usuário for Free: Tela de Bloqueio PRO ──
  if (!isPro && !loading) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto pb-28 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-xs">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Recurso Exclusivo PRO
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Lembretes de Contas a Pagar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Nunca mais pague juros por esquecimento. Agende o vencimento de contas recorrentes (Luz, Água, Internet, Aluguel) e receba notificações automáticas.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111720] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left space-y-3 shadow-xs">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">O que você ganha no PRO:</h2>
          <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              Notificações de contas a vencer no App e no Telegram
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              Pagamento em 1 clique com lançamento automático no histórico
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              IA no Telegram para parcelamentos e frases livres
            </li>
          </ul>
        </div>

        <Link
          href="/pro"
          className="block w-full text-center text-xs font-black py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-[1.01] active:scale-95"
        >
          Desbloquear Recursos PRO por R$ 9,74/mês
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-28 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Header com a palavra PRO Flutuante */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Contas & Lembretes
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Agendamento de contas recorrentes com avisos automáticos de vencimento.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nova Conta
        </button>
      </div>

      {/* Tabs: A Pagar vs Histórico de Pagas */}
      <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>A Pagar / Pendentes</span>
          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.2 rounded-full font-black">
            {bills.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>Histórico de Pagas</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.2 rounded-full font-black">
            {history.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Contas Pendentes a Pagar */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {bills.length === 0 ? (
            <div className="bg-white dark:bg-[#111720] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <span className="material-symbols-outlined text-4xl text-slate-400">receipt_long</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum lembrete pendente</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Todas as suas contas estão em dia! Clique em "Nova Conta" acima para cadastrar novos vencimentos.
              </p>
            </div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white dark:bg-[#111720] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs transition-all hover:border-slate-300"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      {bill.category?.icon || 'receipt_long'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{bill.name}</p>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          bill.status === 'overdue'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            : bill.status === 'today'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                        }`}
                      >
                        {bill.status === 'overdue' ? 'Vencida' : bill.status === 'today' ? 'Vence Hoje' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Vencimento: <strong>{new Date(bill.nextDueDate).toLocaleDateString('pt-BR')}</strong> • R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePayBill(bill)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black active:scale-95 transition-all shadow-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Pagar
                  </button>
                  <button
                    onClick={() => handleDeleteBill(bill.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Excluir Lembrete"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Histórico de Contas Pagas */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white dark:bg-[#111720] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <span className="material-symbols-outlined text-4xl text-slate-400">check_circle</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum pagamento registrado no histórico</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Assim que você clicar em "Pagar" em uma conta pendente, o comprovante será arquivado aqui automaticamente.
              </p>
            </div>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="bg-white dark:bg-[#111720] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{h.description}</p>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        PAGO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pago em: {new Date(h.date).toLocaleDateString('pt-BR')} • R$ {Number(h.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Nova Conta (Design Refatorado com Inputs 100% Alinhados) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 w-full max-w-md space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Novo Lembrete de Conta</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="w-full">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Luz, Aluguel, Internet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full box-border h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500 appearance-none font-sans"
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Valor Aproximado (R$)
                </label>
                <input
                  type="text"
                  required
                  placeholder="150,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full box-border h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500 appearance-none font-sans"
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Próximo Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full box-border h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500 appearance-none font-sans"
                />
              </div>

              <div className="w-full relative">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Recorrência
                </label>
                <div className="relative w-full">
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full box-border h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500 appearance-none font-sans pr-10"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400 text-base">
                    unfold_more
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all"
                >
                  {saving ? 'Salvar...' : 'Cadastrar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
