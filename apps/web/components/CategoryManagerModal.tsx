'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault?: boolean;
  showInDashboard?: boolean;
};

type CategoryManagerModalProps = {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onCategoriesChanged: () => void;
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
  'category',
  'smart_toy',
  'phone_iphone',
  'subscriptions',
  'spa',
  'sports_esports',
];

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

export default function CategoryManagerModal({
  isOpen,
  categories: initialCategories,
  onClose,
  onCategoriesChanged,
}: CategoryManagerModalProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Estado para criar/editar
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('shopping_bag');
  const [color, setColor] = useState('#3b82f6');
  const [showInDashboard, setShowInDashboard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Atualizar estado local instantaneamente quando initialCategories muda
  useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (isOpen) {
      setIsCreating(false);
      setEditingCategory(null);
    }
  }, [isOpen]);

  const handleStartCreate = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setIcon(activeTab === 'expense' ? 'shopping_bag' : 'payments');
    setColor(activeTab === 'expense' ? '#ef4444' : '#10b981');
    setShowInDashboard(true);
    setError('');
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || 'category');
    setColor(cat.color || '#3b82f6');
    setShowInDashboard(cat.showInDashboard ?? true);
    setError('');
  };

  const handleToggleDashboardVisibility = async (cat: Category) => {
    const newValue = !(cat.showInDashboard ?? true);

    // Atualização otimista instantânea no estado local (0ms delay)
    setLocalCategories((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, showInDashboard: newValue } : item))
    );

    try {
      await apiClient.put(`/categories/${cat.id}`, {
        showInDashboard: newValue,
      });
      onCategoriesChanged();
    } catch {
      // Reverter se falhar
      setLocalCategories((prev) =>
        prev.map((item) => (item.id === cat.id ? { ...item, showInDashboard: !newValue } : item))
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingCategory) {
        // Atualizar
        await apiClient.put(`/categories/${editingCategory.id}`, {
          name: name.trim(),
          type,
          icon,
          color,
          showInDashboard,
        });
      } else {
        // Criar
        await apiClient.post('/categories', {
          name: name.trim(),
          type,
          icon,
          color,
          showInDashboard,
        });
      }

      setIsCreating(false);
      setEditingCategory(null);
      setName('');
      onCategoriesChanged();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Deseja remover a categoria "${cat.name}"?`)) return;

    // Remoção otimista instantânea
    setLocalCategories((prev) => prev.filter((item) => item.id !== cat.id));

    try {
      await apiClient.del(`/categories/${cat.id}`);
      onCategoriesChanged();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover categoria.');
      onCategoriesChanged();
    }
  };

  if (!isOpen) return null;

  const filteredCategories = localCategories.filter((c) => c.type === activeTab);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 sm:p-7 w-full max-w-3xl space-y-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* ── Top Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl">category</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Gerenciar Categorias
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Crie, edite e escolha quais categorias exibir no seu painel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Fechar Modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ── Formulário de Criar / Editar Categoria ── */}
        {isCreating || editingCategory ? (
          <form onSubmit={handleSave} className="space-y-5 overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Voltar à lista
              </button>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/60">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome da Categoria */}
              <div className="sm:col-span-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assinaturas, Mercado, Pet Shop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              {/* Tipo (Despesa vs Receita) */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              {/* Exibir no Dashboard Toggle */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Exibir no Dashboard
                </label>
                <button
                  type="button"
                  onClick={() => setShowInDashboard(!showInDashboard)}
                  className={`w-full h-11 px-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                    showInDashboard
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      {showInDashboard ? 'visibility' : 'visibility_off'}
                    </span>
                    {showInDashboard ? 'Visível em "Onde foi seu dinheiro"' : 'Oculto do Dashboard'}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${showInDashboard ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </button>
              </div>
            </div>

            {/* Ícones Presets */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-2">
                Escolha o Ícone
              </label>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 max-h-32 overflow-y-auto">
                {POPULAR_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`h-10 rounded-xl flex items-center justify-center transition-all ${
                      icon === i
                        ? 'bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-400 scale-105'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{i}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Presets */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-2">
                Escolha a Cor
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-2xl transition-all flex items-center justify-center shadow-2xs ${
                      color === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <span className="material-symbols-outlined text-white text-sm font-black">check</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all hover:scale-[1.01] active:scale-95"
              >
                {saving ? 'Salvar...' : 'Salvar Categoria'}
              </button>
            </div>
          </form>
        ) : (
          /* ── Lista de Categorias com Visual Espaçoso ── */
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Top Toolbar (Tabs + Nova Categoria) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('expense')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    activeTab === 'expense'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Despesas ({localCategories.filter((c) => c.type === 'expense').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('income')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    activeTab === 'income'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Receitas ({localCategories.filter((c) => c.type === 'income').length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartCreate}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-[1.01] active:scale-95"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Nova Categoria
              </button>
            </div>

            {/* Listagem 2 Colunas */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs font-bold text-slate-500">Nenhuma categoria cadastrada nesta aba.</p>
                <button onClick={handleStartCreate} className="text-xs text-emerald-600 font-extrabold underline">
                  Clique aqui para criar a primeira
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((cat) => {
                  const isVisible = cat.showInDashboard ?? true;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#161f2e] hover:border-emerald-500/40 flex items-center justify-between gap-3 shadow-2xs transition-all group"
                    >
                      {/* Ícone e Nome Completo */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color || '#3b82f6' }}
                        >
                          <span className="material-symbols-outlined text-lg">{cat.icon || 'category'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight break-words pr-1">
                            {cat.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isVisible
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {isVisible ? 'visibility' : 'visibility_off'}
                              </span>
                              {isVisible ? 'No Dashboard' : 'Oculta'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Toggle de Visibilidade no Dashboard */}
                        <button
                          type="button"
                          onClick={() => handleToggleDashboardVisibility(cat)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isVisible
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                          title={isVisible ? 'Ocultar do Dashboard' : 'Exibir no Dashboard'}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isVisible ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                          title="Editar Categoria"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>

                        {/* Excluir */}
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-all"
                          title="Excluir Categoria"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
