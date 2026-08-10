import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly TTL_MS = 15000; // 15 segundos de cache ultra-rápido em memória

  constructor(private prisma: PrismaService) {}

  public clearUserCache(userId: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(userId)) {
        this.cache.delete(key);
      }
    }
  }

  async getSummary(userId: string, yearMonth?: string) {
    const cacheKey = `${userId}:summary:${yearMonth || 'current'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-11

    if (yearMonth && /^\d{4}-\d{2}$/.test(yearMonth)) {
      const [y, m] = yearMonth.split('-').map(Number);
      year = y;
      month = m - 1;
    }

    const firstDayCurrentMonth = new Date(year, month, 1);
    const lastDayCurrentMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const firstDayPreviousMonth = new Date(year, month - 1, 1);
    const lastDayPreviousMonth = new Date(year, month, 0, 23, 59, 59);

    // Buscar usuário para limite do cartão + transações do mês e agregações de saldo
    const [user, currentTxs, previousTxs, incomeSum, expenseSum] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { creditCardLimit: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDayCurrentMonth, lte: lastDayCurrentMonth } },
        select: { amount: true, type: true, paymentMethod: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDayPreviousMonth, lte: lastDayPreviousMonth } },
        select: { amount: true, type: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, deletedAt: null, type: 'income', date: { lte: lastDayCurrentMonth } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, deletedAt: null, type: 'expense', paymentMethod: { not: 'credit' }, date: { lte: lastDayCurrentMonth } },
        _sum: { amount: true },
      }),
    ]);

    // Saldo acumulado histórico calculado diretamente no PostgreSQL
    const currentBalance = Number(incomeSum._sum.amount || 0) - Number(expenseSum._sum.amount || 0);

    // Totais do mês selecionado
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCreditExpense = 0;
    let totalDebitExpense = 0;

    currentTxs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        totalIncome += amt;
      } else if (t.type === 'expense') {
        totalExpense += amt;
        if (t.paymentMethod === 'credit') {
          totalCreditExpense += amt;
        } else {
          totalDebitExpense += amt;
        }
      }
    });

    // Totais do mês anterior
    let prevIncome = 0;
    let prevExpense = 0;
    previousTxs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') prevIncome += amt;
      else if (t.type === 'expense') prevExpense += amt;
    });
    const previousMonthBalance = prevIncome - prevExpense;

    // Cálculo da porcentagem de variação
    let monthChangePercentage = 0;
    if (previousMonthBalance !== 0) {
      monthChangePercentage = Math.round(((totalIncome - totalExpense - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100);
    } else if (totalIncome - totalExpense > 0) {
      monthChangePercentage = 100;
    }

    // Cálculo da Meta de Cartão de Crédito para o mês selecionado
    const limit = user?.creditCardLimit ? Number(user.creditCardLimit) : 0;
    const remaining = Math.max(0, limit - totalCreditExpense);
    const usedPercentage = limit > 0 ? Math.min(100, Math.round((totalCreditExpense / limit) * 100)) : 0;
    let cardStatus: 'none' | 'ok' | 'warning' | 'danger' | 'exceeded' = 'none';

    if (limit > 0) {
      if (totalCreditExpense > limit) cardStatus = 'exceeded';
      else if (usedPercentage >= 90) cardStatus = 'danger';
      else if (usedPercentage >= 70) cardStatus = 'warning';
      else cardStatus = 'ok';
    }

    const monthBalance = totalIncome - totalExpense;

    const result = {
      currentBalance,
      monthBalance,
      totalIncome,
      totalExpense,
      totalCreditExpense,
      totalDebitExpense,
      previousMonthBalance,
      monthChangePercentage,
      creditCard: {
        limit,
        spent: totalCreditExpense,
        remaining,
        usedPercentage,
        status: cardStatus,
      },
    };

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL_MS });
    return result;
  }

  async getCalendar(userId: string, yearMonth?: string) {
    const cacheKey = `${userId}:calendar:${yearMonth || 'current'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-11

    if (yearMonth && /^\d{4}-\d{2}$/.test(yearMonth)) {
      const [y, m] = yearMonth.split('-').map(Number);
      year = y;
      month = m - 1;
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const txs = await this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const daysMap: Record<string, {
      date: string;
      dayNumber: number;
      totalIncome: number;
      totalExpense: number;
      transactions: any[];
    }> = {};

    // Preencher todos os dias do mês
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysMap[dateStr] = {
        date: dateStr,
        dayNumber: d,
        totalIncome: 0,
        totalExpense: 0,
        transactions: [],
      };
    }

    txs.forEach((t) => {
      const d = new Date(t.date);
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const targetStr = daysMap[dateStr] ? dateStr : t.date.toISOString().split('T')[0];

      if (daysMap[targetStr]) {
        const amt = Number(t.amount);
        if (t.type === 'income') daysMap[targetStr].totalIncome += amt;
        else if (t.type === 'expense') daysMap[targetStr].totalExpense += amt;

        daysMap[targetStr].transactions.push({
          id: t.id,
          description: t.description,
          amount: amt,
          type: t.type,
          paymentMethod: t.paymentMethod,
          category: t.category ? { name: t.category.name, icon: t.category.icon, color: t.category.color } : null,
        });
      }
    });

    const result = {
      year,
      month: month + 1,
      yearMonth: `${year}-${String(month + 1).padStart(2, '0')}`,
      days: Object.values(daysMap),
    };

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL_MS });
    return result;
  }

  async getByCategory(userId: string, yearMonth?: string) {
    const cacheKey = `${userId}:category:${yearMonth || 'current'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const where: any = { userId, deletedAt: null, type: 'expense' };

    if (yearMonth && /^\d{4}-\d{2}$/.test(yearMonth)) {
      const [y, m] = yearMonth.split('-').map(Number);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }

    const txs = await this.prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    const groups: Record<string, { categoryId: string; name: string; icon: string; color: string; total: number }> = {};
    let totalAll = 0;

    txs.forEach((t) => {
      const catId = t.categoryId || 'uncategorized';
      const name = t.category?.name || 'Sem Categoria';
      const icon = t.category?.icon || 'shopping_bag';
      const color = t.category?.color || '#003535';
      const amt = Number(t.amount);

      if (!groups[catId]) {
        groups[catId] = { categoryId: catId, name, icon, color, total: 0 };
      }
      groups[catId].total += amt;
      totalAll += amt;
    });

    const result = Object.values(groups).map((g) => ({
      ...g,
      percentage: totalAll > 0 ? Math.round((g.total / totalAll) * 100) : 0,
    }));

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL_MS });
    return result;
  }

  async getMonthlyEvolution(userId: string) {
    const cacheKey = `${userId}:evolution`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const txs = await this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthsMap: Record<string, { month: string; income: number; expense: number; balance: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const formattedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      monthsMap[key] = { month: formattedLabel, income: 0, expense: 0, balance: 0 };
    }

    txs.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        const amt = Number(t.amount);
        if (t.type === 'income') monthsMap[key].income += amt;
        else if (t.type === 'expense') monthsMap[key].expense += amt;
        monthsMap[key].balance = monthsMap[key].income - monthsMap[key].expense;
      }
    });

    const result = Object.values(monthsMap);
    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.TTL_MS });
    return result;
  }
}
