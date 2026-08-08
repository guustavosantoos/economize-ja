import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Buscar usuário para limite do cartão + transações
    const [user, allTxs, currentTxs, previousTxs] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { creditCardLimit: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDayCurrentMonth } },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDayPreviousMonth, lt: firstDayCurrentMonth } },
      }),
    ]);

    // Saldo acumulado histórico
    let currentBalance = 0;
    allTxs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') currentBalance += amt;
      else if (t.type === 'expense') currentBalance -= amt;
    });

    // Totais do mês atual
    let totalIncome = 0;
    let totalExpense = 0;
    currentTxs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') totalIncome += amt;
      else if (t.type === 'expense') totalExpense += amt;
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

    // Calculo da porcentagem de variação
    let monthChangePercentage = 0;
    if (previousMonthBalance !== 0) {
      monthChangePercentage = Math.round(((totalIncome - totalExpense - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100);
    } else if (totalIncome - totalExpense > 0) {
      monthChangePercentage = 100;
    }

    // Cálculo da Meta de Cartão de Crédito
    const limit = user?.creditCardLimit ? Number(user.creditCardLimit) : 0;
    const remaining = Math.max(0, limit - totalExpense);
    const usedPercentage = limit > 0 ? Math.min(100, Math.round((totalExpense / limit) * 100)) : 0;
    let cardStatus: 'none' | 'ok' | 'warning' | 'danger' | 'exceeded' = 'none';

    if (limit > 0) {
      if (totalExpense > limit) cardStatus = 'exceeded';
      else if (usedPercentage >= 90) cardStatus = 'danger';
      else if (usedPercentage >= 70) cardStatus = 'warning';
      else cardStatus = 'ok';
    }

    return {
      currentBalance,
      totalIncome,
      totalExpense,
      previousMonthBalance,
      monthChangePercentage,
      creditCard: {
        limit,
        spent: totalExpense,
        remaining,
        usedPercentage,
        status: cardStatus,
      },
    };
  }

  async getCalendar(userId: string, yearMonth?: string) {
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
          category: t.category ? { name: t.category.name, icon: t.category.icon, color: t.category.color } : null,
        });
      }
    });

    return {
      year,
      month: month + 1,
      yearMonth: `${year}-${String(month + 1).padStart(2, '0')}`,
      days: Object.values(daysMap),
    };
  }

  async getByCategory(userId: string) {
    const txs = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null, type: 'expense' },
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

    return Object.values(groups).map((g) => ({
      ...g,
      percentage: totalAll > 0 ? Math.round((g.total / totalAll) * 100) : 0,
    }));
  }

  async getMonthlyEvolution(userId: string) {
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

    // Mapeia os últimos 6 meses
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

    return Object.values(monthsMap);
  }
}
