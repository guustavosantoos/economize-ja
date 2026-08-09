'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api-client';
import TransactionItem from '../../../components/TransactionItem';

type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number | string;
  description?: string;
  date: string;
  source?: string;
  category?: {
    name: string;
    icon?: string;
  };
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
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
    loadTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    if (typeFilter === 'all') return true;
    return t.type === typeFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Transações</h1>
        <Link
          href="/transactions/new"
          data-cy="transactions-add-button"
          className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-ambient transition-all hover:opacity-90 active:scale-95"
        >
          + Nova
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          data-cy="transactions-type-filter"
          value={typeFilter}
          onChange={(e: any) => setTypeFilter(e.target.value)}
          className="bg-surface border border-outline-variant rounded-xl p-3 flex-1 text-sm font-medium focus:outline-none focus:border-primary"
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
        <div className="py-12 text-center bg-surface rounded-2xl border border-surface-variant p-8">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
          <p className="font-semibold text-on-surface">Nenhuma transação encontrada</p>
          <p className="text-xs text-outline mt-1 mb-4">Cadastre sua primeira receita ou despesa!</p>
          <Link
            href="/transactions/new"
            className="inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold"
          >
            Adicionar Transação
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant overflow-hidden shadow-ambient">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
