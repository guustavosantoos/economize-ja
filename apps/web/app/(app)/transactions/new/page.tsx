'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';

type Category = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'expense' | 'income' | 'transfer';
};

const POPULAR_ICONS = [
  'restaurant',
  'shopping_bag',
  'directions_car',
  'home',
  'medical_services',
  'school',
  'movie',
  'receipt_long',
  'pets',
  'fitness_center',
  'flight',
  'local_bar',
  'build',
  'payments',
  'work',
  'trending_up',
  'card_giftcard',
  'attach_money',
];

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

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

  // Modal para Criar Nova Categoria
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatIcon, setNewCatIcon] = useState('shopping_bag');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [catError, setCatError] = useState('');

  useEffect(() => {
    if (paramDate) {
      setDate(paramDate);
    }
  }, [paramDate]);

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
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.type === type || !c.type
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCategory(true);
    setCatError('');

    try {
      const createdCat = await apiClient.post('/categories', {
        name: newCatName.trim(),
        type: newCatType,
        icon: newCatIcon,
        color: newCatColor,
      });

      await loadCategories();

      if (createdCat?.id) {
        setCategoryId(createdCat.id);
      }

      setShowCategoryModal(false);
      setNewCatName('');
    } catch (err: any) {
      setCatError(err.message || 'Erro ao criar categoria');
    } finally {
      setCreatingCategory(false);
    }
  };

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
            onClick={() => {
              setType('expense');
              setNewCatType('expense');
            }}
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
            onClick={() => {
              setType('income');
              setNewCatType('income');
            }}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-on-surface block">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-xs font-extrabold text-primary dark:text-[#2dd4bf] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Nova Categoria</span>
              </button>
            </div>
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
              placeholder="Ex: Almoço de domingo, Mercado, Salário..."
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

      {/* Modal Criar Nova Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setShowCategoryModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#151d27] rounded-3xl border border-surface-variant dark:border-[#253346] shadow-2xl p-6 z-10 text-on-surface animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-[#2dd4bf] text-2xl">
                  category
                </span>
                <h3 className="font-extrabold text-base text-on-surface">Criar Nova Categoria</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {catError && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl mb-4 font-bold border border-rose-500/20">
                {catError}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-outline block mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pets, Mercado, Academia, Assinaturas..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-xs font-semibold text-on-surface outline-none focus:border-primary"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-1">
                  Tipo de Categoria
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatType('expense')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      newCatType === 'expense'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                        : 'border-surface-variant dark:border-[#253346] text-outline'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('income')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      newCatType === 'income'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-surface-variant dark:border-[#253346] text-outline'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-2">
                  Escolha um Ícone
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-surface-variant dark:border-[#253346] rounded-xl">
                  {POPULAR_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCatIcon(icon)}
                      className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                        newCatIcon === icon
                          ? 'bg-primary text-white scale-105 shadow-xs'
                          : 'bg-surface dark:bg-[#1e2836] text-outline hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-outline block mb-2">
                  Cor da Categoria
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newCatColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-3 rounded-xl border border-surface-variant dark:border-[#253346] text-xs font-bold text-on-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:opacity-95 transition-all"
                >
                  {creatingCategory ? 'Criando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
