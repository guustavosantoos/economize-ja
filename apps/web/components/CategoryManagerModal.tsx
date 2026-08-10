'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault?: boolean;
};

type CategoryManagerModalProps = {
  isOpen: boolean;
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
  onClose,
  onCategoriesChanged,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [loading, setLoading] = useState(true);

  // Estado para criar/editar
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('shopping_bag');
  const [color, setColor] = useState('#3b82f6');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // Ignorar se erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
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
    setError('');
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
        });
      } else {
        // Criar
        await apiClient.post('/categories', {
          name: name.trim(),
          type,
          icon,
          color,
        });
      }

      setIsCreating(false);
      setEditingCategory(null);
      setName('');
      await loadCategories();
      onCategoriesChanged();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Deseja remover a categoria "${cat.name}"?`)) return;

    try {
      await apiClient.del(`/categories/${cat.id}`);
      await loadCategories();
      onCategoriesChanged();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover categoria.');
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 w-full max-w-lg space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-xl">category</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Gerenciar Categorias</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Formulário de Criar/Editar */}
        {(isCreating || editingCategory) ? (
          <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Voltar à lista
              </button>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                {error}
              </p>
            )}

            {/* Nome */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Assinaturas, Mercado, Pet Shop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Receita
                </button>
              </div>
            </div>

            {/* Ícones Presets */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Ícone</label>
              <div className="grid grid-cols-6 gap-2 max-h-28 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                {POPULAR_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                      icon === i
                        ? 'bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-400'
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
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Cor</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                      color === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all"
              >
                {saving ? 'Salvar...' : 'Salvar Categoria'}
              </button>
            </div>
          </form>
        ) : (
          /* Lista de Categorias com Abas Despesa / Receita */
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('expense')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'expense'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Despesas ({categories.filter((c) => c.type === 'expense').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('income')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'income'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Receitas ({categories.filter((c) => c.type === 'income').length})
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Nova Categoria
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-center text-slate-400 py-6">Carregando categorias...</p>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs font-bold text-slate-500">Nenhuma categoria encontrada.</p>
                <button
                  onClick={handleStartCreate}
                  className="text-xs text-emerald-600 font-extrabold underline"
                >
                  Clique aqui para criar a primeira
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                      >
                        <span className="material-symbols-outlined text-base">
                          {cat.icon || 'category'}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Editar Categoria"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Excluir Categoria"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
