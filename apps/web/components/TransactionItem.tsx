'use client';

type Props = {
  id: string;
  category: string;
  categoryIcon: string;
  name: string;
  source: string;
  amount: number;
  type: 'income' | 'expense';
};

export default function TransactionItem({ id, category, categoryIcon, name, source, amount, type }: Props) {
  return (
    <div data-cy={`transaction-item-${id}`} className="flex items-center gap-4 py-3 bg-surface-container-lowest border-b border-surface-variant last:border-0 px-4">
      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant">{categoryIcon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-on-surface truncate">{name}</p>
        <p className="text-xs text-outline truncate">{source} · {category}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`font-bold text-sm ${type === 'income' ? 'text-secondary' : ''}`}
          style={type === 'expense' ? { color: '#e11d48' } : undefined}
        >
          {type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </p>
      </div>
    </div>
  );
}
