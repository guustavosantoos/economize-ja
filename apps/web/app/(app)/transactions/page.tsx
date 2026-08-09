'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import TransactionItem from '../../../components/TransactionItem';

type Category = {
  id: string;
  name: string;
  type?: string;
};

type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number | string;
  description?: string;
  date: string;
  source?: string;
  categoryId?: string;
  category?: {
    id?: string;
    name: string;
    icon?: string;
  };
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Modal de Edição
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [editDate, setEditDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Modal de Exclusão
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadTransactions() {
    try {
      const data = await apiClient.get('/transactions');
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await apiClient.get('/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const handleStartEdit = (tx: Transaction) => {
    setEditingTx(tx);
    const numAmount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    setEditAmount(numAmount ? String(numAmount) : '');
    setEditDescription(tx.description || '');
    setEditCategoryId(tx.categoryId || tx.category?.id || '');
    setEditType(tx.type || 'expense');
    setEditDate(tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const numAmount = parseFloat(editAmount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setEditError('Informe um valor válido.');
      return;
    }

    setSavingEdit(true);
    setEditError('');

    try {
      await apiClient.put(`/transactions/${editingTx.id}`, {
        amount: numAmount,
        type: editType,
        categoryId: editCategoryId || undefined,
        description: editDescription || undefined,
        date: editDate ? new Date(editDate).toISOString() : undefined,
      });

      await loadTransactions();
      setEditingTx(null);
    } catch (err: any) {
      setEditError(err.message || 'Erro ao salvar alterações');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTxId) return;

    setDeleting(true);
    try {
      await apiClient.del(`/transactions/${deletingTxId}`);
      await loadTransactions();
      setDeletingTxId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir transação');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (typeFilter === 'all') return true;
    return t.type === typeFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-28">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary dark:text-[#2dd4bf]">Transações</h1>
        <Link
          href="/transactions/new"
          data-cy="transactions-add-button"
          className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          + Nova
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          data-cy="transactions-type-filter"
          value={typeFilter}
          onChange={(e: any) => setTypeFilter(e.target.value)}
          className="bg-white dark:bg-[#151d27] border border-surface-variant dark:border-[#253346] text-on-surface dark:text-slate-100 rounded-xl p-3 flex-1 text-sm font-semibold focus:outline-none focus:border-primary"
        >
          <option value="all">Todas as transações</option>
          <option value="expense">Somente Despesas</option>
          <option value="income">Somente Receitas</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-outline text-sm animate-pulse">
          Carregando transações...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#151d27] rounded-3xl border border-surface-variant dark:border-[#253346] p-8 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
          <p className="font-bold text-on-surface dark:text-slate-100">Nenhuma transação encontrada</p>
          <p className="text-xs text-outline mt-1 mb-4">Cadastre sua primeira receita ou despesa!</p>
          <Link
            href="/transactions/new"
            className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm"
          >
            Adicionar Transação
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#151d27] rounded-3xl border border-surface-variant dark:border-[#253346] overflow-hidden shadow-sm">
          {filtered.map((t) => (
            <TransactionItem
              key={t.id}
              id={t.id}
              category={t.category?.name || 'Geral'}
              categoryIcon={t.category?.icon || (t.type === 'income' ? 'arrow_downward' : 'shopping_bag')}
              name={t.description || (t.type === 'income' ? 'Receita' : 'Despesa')}
              source={t.source === 'bot_free' || t.source === 'bot_pro' ? 'Telegram' : 'Web'}
              amount={typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount}
              type={t.type === 'income' ? 'income' : 'expense'}
              onEdit={() => handleStartEdit(t)}
              onDelete={(id) => setDeletingTxId(id)}
            />
          ))}
        </div>
      )}

      {/* Modal Editar Transação */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setEditingTx(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#151d27] rounded-3xl border border-surface-variant dark:border-[#253346] shadow-2xl p-6 z-10 text-on-surface animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-[#2dd4bf] text-2xl">edit_note</span>
                <h3 className="font-extrabold text-base text-on-surface dark:text-slate-100">Editar Transação</h3>
              </div>
              <button onClick={() => setEditingTx(null)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {editError && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl mb-4 font-bold border border-rose-500/20">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-outline block mb-1">Valor (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-sm font-bold text-on-surface dark:text-slate-100 outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('expense')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      editType === 'expense'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                        : 'border-surface-variant dark:border-[#253346] text-outline'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('income')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      editType === 'income'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-surface-variant dark:border-[#253346] text-outline'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Categoria</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-xs font-semibold text-on-surface dark:text-slate-100 outline-none focus:border-primary"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories
                    .filter((c) => !c.type || c.type === editType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Almoço, Supermercado..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-xs font-semibold text-on-surface dark:text-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">Data</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-xs font-semibold text-on-surface dark:text-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-3 rounded-xl border border-surface-variant dark:border-[#253346] text-xs font-bold text-on-surface dark:text-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !deleting && setDeletingTxId(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#151d27] rounded-3xl border border-surface-variant dark:border-[#253346] shadow-2xl p-6 z-10 text-on-surface animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-on-surface dark:text-slate-100">Excluir Transação?</h3>
                <p className="text-xs text-outline">Essa ação atualizará seu saldo.</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed mb-5">
              Tem certeza que deseja apagar este lançamento? O valor será removido do seu histórico de finanças.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingTxId(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-surface-variant dark:border-[#253346] text-xs font-bold text-on-surface dark:text-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
