'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api-client';

type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  recurrence: string;
  nextDueDate: string;
  status: 'overdue' | 'today' | 'pending';
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
};

export default function BillsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isPro = user?.plan === 'pro';

  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas.');
    } finally {
      setLoading(false);
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
      await loadBills();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar lembrete.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayBill = async (id: string) => {
    try {
      await apiClient.post(`/bills/${id}/pay`);
      await loadBills();
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar conta como paga.');
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Deseja remover este lembrete?')) return;
    try {
      await apiClient.del(`/bills/${id}`);
      await loadBills();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover conta.');
    }
  };

  // ── Se o Usuário for Free: Tela de Bloqueio PRO ──
  if (!isPro && !loading) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto pb-28 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Recurso Exclusivo PRO
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Lembretes de Contas a Pagar
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Nunca mais pague juros por esquecimento. Agende o vencimento de contas recorrentes (Luz, Água, Internet, Aluguel) e receba notificações automáticas.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-white dark:bg-[#111720] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-left space-y-3 shadow-sm">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">O que você ganha no PRO:</h2>
          <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              Notificações de contas a vencer no App e no Telegram
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              Botão de pagamento em 1 clique (gera a despesa automaticamente)
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
              IA no Telegram para parcelamentos e frases livres
            </li>
          </ul>
        </div>

        <Link
          href="/pro"
          className="block w-full text-center text-xs font-black py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all hover:scale-[1.01] active:scale-95"
        >
          Desbloquear Recursos PRO
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-28 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Contas & Lembretes
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Contas recorrentes com avisos automáticos de vencimento.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nova Conta
        </button>
      </div>

      {/* List of Bills */}
      <div className="space-y-3">
        {bills.length === 0 ? (
          <div className="bg-white dark:bg-[#111720] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-400">receipt_long</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum lembrete cadastrado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cadastre suas contas mensais como Água, Luz, Aluguel e Internet para ser avisado.</p>
          </div>
        ) : (
          bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white dark:bg-[#111720] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
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
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bill.status === 'overdue'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : bill.status === 'today'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {bill.status === 'overdue' ? 'Vencida' : bill.status === 'today' ? 'Vence Hoje' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Vencimento: {new Date(bill.nextDueDate).toLocaleDateString('pt-BR')} • R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handlePayBill(bill.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                  title="Marcar como paga e registrar despesa"
                >
                  Pagar
                </button>
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 w-full max-w-md space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Novo Lembrete de Conta</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Luz, Aluguel, Internet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Valor Aproximado (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="150,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Próximo Vencimento</label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Recorrência</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
                >
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
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
