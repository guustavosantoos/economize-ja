'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import { useAuthStore } from '../../../../stores/auth.store';

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
  const { user } = useAuthStore();

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [paymentMethod, setPaymentMethod] = useState<'debit' | 'credit'>('debit');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [showProModal, setShowProModal] = useState(false);
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
        paymentMethod: type === 'expense' ? paymentMethod : 'debit',
        installmentsCount: type === 'expense' && paymentMethod === 'credit' ? installmentsCount : 1,
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-on-surface block">
                Categoria
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 dark:bg-[#2dd4bf]/10 text-primary dark:text-[#2dd4bf] hover:bg-primary/20 transition-all font-bold text-[11px] active:scale-95"
              >
                <span className="material-symbols-outlined text-sm leading-none">add_circle</span>
                <span className="leading-none">Nova Categoria</span>
              </button>
            </div>
            <div className="relative">
              {/* Trigger Button */}
              <button
                data-cy="add-transaction-category-select"
                type="button"
                onClick={() => setShowCategoryDropdown((v) => !v)}
                className="w-full p-4 rounded-2xl border border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface font-semibold text-sm focus:outline-none focus:border-primary flex items-center justify-between text-left"
              >
                <span className={categoryId ? 'text-on-surface' : 'text-outline'}>
                  {categoryId
                    ? filteredCategories.find((c) => c.id === categoryId)?.name || 'Selecione uma categoria...'
                    : 'Selecione uma categoria...'}
                </span>
                <span
                  className="material-symbols-outlined text-outline transition-transform duration-200"
                  style={{ transform: showCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {/* Custom Dropdown List */}
              {showCategoryDropdown && (
                <>
                  {/* Backdrop to close */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-[#1e2836] border border-surface-variant dark:border-[#253346] rounded-2xl shadow-2xl overflow-hidden">
                    {filteredCategories.length === 0 && (
                      <p className="px-4 py-3 text-sm text-outline text-center">Nenhuma categoria encontrada</p>
                    )}
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-semibold flex items-center gap-3 transition-colors ${
                          categoryId === cat.id
                            ? 'bg-primary/10 dark:bg-[#2dd4bf]/10 text-primary dark:text-[#2dd4bf]'
                            : 'text-on-surface hover:bg-surface-container dark:hover:bg-[#253346]'
                        }`}
                      >
                        {cat.icon && (
                          <span className="material-symbols-outlined text-lg flex-shrink-0">{cat.icon}</span>
                        )}
                        <span>{cat.name}</span>
                        {categoryId === cat.id && (
                          <span className="material-symbols-outlined text-base ml-auto">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
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

          {/* Forma de Pagamento (Apenas para Despesas) */}
          {type === 'expense' && (
            <>
              <div>
                <label className="text-xs font-bold text-on-surface mb-2 block">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('debit');
                      setInstallmentsCount(1);
                    }}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      paymentMethod === 'debit'
                        ? 'bg-primary/10 border-primary text-primary dark:bg-[#2dd4bf]/10 dark:border-[#2dd4bf] dark:text-[#2dd4bf] shadow-sm'
                        : 'border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                    <span>Débito / Pix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      paymentMethod === 'credit'
                        ? 'bg-primary/10 border-primary text-primary dark:bg-[#2dd4bf]/10 dark:border-[#2dd4bf] dark:text-[#2dd4bf] shadow-sm'
                        : 'border-surface-variant dark:border-[#253346] bg-surface dark:bg-[#1e2836] text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    <span>Cartão de Crédito</span>
                  </button>
                </div>
              </div>

              {/* Se for no Cartão de Crédito: Opção de Parcelamento */}
              {paymentMethod === 'credit' && (
                <div className="bg-surface-container-low dark:bg-[#1e2836]/60 p-4 rounded-2xl border border-surface-variant dark:border-[#253346] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">
                      Parcelamento (Valor Total: R$ {amount || '0,00'})
                    </label>
                    {installmentsCount > 1 && (
                      <span className="text-[11px] font-bold text-primary dark:text-[#2dd4bf]">
                        {installmentsCount}x de R$ {(() => {
                          const cleanNum = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
                          return (cleanNum / installmentsCount).toFixed(2).replace('.', ',');
                        })()} / mês
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={installmentsCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 1 && user?.plan !== 'pro') {
                          setShowProModal(true);
                          setInstallmentsCount(1);
                        } else {
                          setInstallmentsCount(val);
                        }
                      }}
                      className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#253346] bg-white dark:bg-[#151d27] text-on-surface font-bold text-xs focus:outline-none focus:border-primary appearance-none pr-10"
                    >
                      <option value={1}>1x - À vista (R$ {amount || '0,00'})</option>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((n) => {
                        const cleanNum = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
                        const instVal = cleanNum > 0 ? (cleanNum / n).toFixed(2).replace('.', ',') : '0,00';
                        return (
                          <option key={n} value={n}>
                            {n}x de R$ {instVal} / mês (Total R$ {amount || '0,00'})
                          </option>
                        );
                      })}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-outline">
                      keyboard_arrow_down
                    </span>
                  </div>
                  {installmentsCount > 1 && (
                    <p className="text-[11px] text-outline font-medium">
                      💡 Compra Total: <strong>R$ {amount || '0,00'}</strong> em <strong>{installmentsCount}x de R$ {(() => {
                        const cleanNum = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
                        return (cleanNum / installmentsCount).toFixed(2).replace('.', ',');
                      })()} / mês</strong>. Uma parcela será agendada automaticamente em cada mês.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
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

      {/* Modal de Upgrade PRO para Parcelamento */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 w-full max-w-md space-y-4 border border-slate-200 dark:border-slate-800 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Recurso do Plano PRO
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Compras Parceladas no Cartão
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                O parcelamento de 2x a 24x com lançamento automático de faturas mês a mês é um recurso exclusivo para assinantes do <strong>Plano PRO</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push('/pro')}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all"
              >
                Conhecer o Plano PRO por R$ 9,74/mês
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Continuar no Plano Free (À Vista)
              </button>
            </div>
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
