'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';

type Category = {
  id: string;
  name: string;
  icon?: string;
  type: 'expense' | 'income' | 'transfer';
};

function NewTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramDate = searchParams.get('date');

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => {
    if (paramDate) return paramDate;
    return new Date().toISOString().split('T')[0];
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paramDate) {
      setDate(paramDate);
    }
  }, [paramDate]);

  useEffect(() => {
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
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.type === type || !c.type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.replace(/\./g, '').replace(',', '.');
    const numAmount = parseFloat(cleanAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/transactions', {
        amount: numAmount,
        type,
        categoryId: categoryId || undefined,
        description: description || undefined,
        date: new Date(date).toISOString(),
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar transação');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#151d27] border border-surface-variant dark:border-[#253346] flex items-center justify-center text-on-surface hover:bg-surface-container transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-primary">Nova Transação</h1>
        <div className="w-10" />
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Input de Valor - Cripto/Fintech Style */}
        <div
          className={`p-8 rounded-3xl text-white text-center shadow-xl transition-all ${
            type === 'expense'
              ? 'bg-gradient-to-br from-[#8f0012] to-[#65000a]'
              : type === 'income'
              ? 'bg-gradient-to-br from-[#006c49] to-[#004d34]'
              : 'bg-gradient-to-br from-[#003535] to-[#0d4d4d]'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
            {type === 'expense' ? 'Valor da Despesa' : type === 'income' ? 'Valor da Receita' : 'Valor da Transferência'}
          </p>

          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold opacity-80">R$</span>
            <input
              data-cy="add-transaction-amount-input"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ background: 'transparent', color: '#ffffff' }}
              className="bg-transparent text-5xl font-black text-center outline-none w-full max-w-[240px] placeholder:text-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Segmented Control Tipo */}
        <div className="bg-surface-container-high dark:bg-[#1e2836] p-1.5 rounded-2xl flex gap-1">
          <button
            type="button"
            data-cy="add-transaction-type-expense"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'bg-white dark:bg-[#151d27] text-error shadow-sm'
                : 'text-on-surface-variant opacity-70 hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
            Despesa
          </button>

          <button
            type="button"
            data-cy="add-transaction-type-income"
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-white dark:bg-[#151d27] text-secondary shadow-sm'
                : 'text-on-surface-variant opacity-70 hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">arrow_downward</span>
            Receita
          </button>

          <button
            type="button"
            data-cy="add-transaction-type-transfer"
            onClick={() => setType('transfer')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              type === 'transfer'
                ? 'bg-white dark:bg-[#151d27] text-primary shadow-sm'
                : 'text-on-surface-variant opacity-70 hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm font-bold">swap_horiz</span>
            Transf.
          </button>
        </div>

        {/* Form Inputs */}
        <div className="bg-white dark:bg-[#151d27] p-6 rounded-3xl border border-surface-variant dark:border-[#253346] shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-on-surface mb-1.5 block">
              Categoria
            </label>
            <div className="relative">
              <select
                data-cy="add-transaction-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-4 rounded-2xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface font-semibold text-sm focus:outline-none focus:border-primary appearance-none pr-10"
              >
                <option value="">Selecione uma categoria...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3.5 top-4 pointer-events-none text-outline">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface mb-1.5 block">
              Descrição
            </label>
            <input
              data-cy="add-transaction-description-input"
              placeholder="Ex: Almoço de domingo, Uber..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-2xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface font-semibold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface mb-1.5 block">
              Data da Transação
            </label>
            <input
              data-cy="add-transaction-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 rounded-2xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface font-semibold text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          data-cy="add-transaction-save-button"
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary py-4 rounded-2xl font-extrabold text-base shadow-lg shadow-primary/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Transação'}
        </button>
      </form>
    </div>
  );
}

export default function NewTransaction() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-outline">Carregando formulário...</div>}>
      <NewTransactionForm />
    </Suspense>
  );
}
