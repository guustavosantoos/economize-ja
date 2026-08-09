'use client';

type Props = {
  id: string;
  category: string;
  categoryIcon: string;
  name: string;
  source: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function TransactionItem({
  id,
  category,
  categoryIcon,
  name,
  source,
  amount,
  type,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      data-cy={`transaction-item-${id}`}
      className="group flex items-center justify-between gap-3 py-3.5 px-4 bg-white dark:bg-[#151d27] border-b border-surface-variant dark:border-[#253346] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1c2635] transition-all"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-2xl bg-surface-container dark:bg-[#1e2836] flex items-center justify-center shrink-0 text-on-surface-variant">
          <span className="material-symbols-outlined text-lg">{categoryIcon || 'payments'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-xs md:text-sm text-on-surface dark:text-slate-100 truncate">{name}</p>
          <p className="text-[11px] text-outline dark:text-slate-400 truncate">
            {source} · <span className="font-semibold text-primary dark:text-[#2dd4bf]">{category}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p
          className={`font-black text-xs md:text-sm ${
            type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </p>

        {/* Action Buttons: Edit and Delete */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="w-8 h-8 rounded-xl bg-surface-container dark:bg-[#1e2836] hover:bg-primary/10 text-outline hover:text-primary dark:hover:text-[#2dd4bf] flex items-center justify-center transition-all active:scale-95"
              title="Editar transação"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="w-8 h-8 rounded-xl bg-surface-container dark:bg-[#1e2836] hover:bg-rose-500/10 text-outline hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all active:scale-95"
              title="Excluir transação"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
