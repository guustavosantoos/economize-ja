import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TelegramService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getLinkStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    if (user?.plan !== 'pro') {
      throw new ForbiddenException('O recurso do Bot do Telegram com IA é exclusivo do Plano PRO. Faça o upgrade para continuar!');
    }

    const link = await this.prisma.telegramLink.findUnique({ where: { userId } });
    if (!link) {
      return { linked: false, linkCode: null, expiresAt: null, linkedAt: null };
    }
    const isLinked = !!link.telegramChatId;
    return {
      linked: isLinked,
      linkCode: link.linkCode,
      expiresAt: link.linkCodeExpiresAt ? link.linkCodeExpiresAt.toISOString() : null,
      linkedAt: link.linkedAt ? link.linkedAt.toISOString() : null,
    };
  }

  async generateLinkCode(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    if (user?.plan !== 'pro') {
      throw new ForbiddenException('O recurso do Bot do Telegram com IA é exclusivo do Plano PRO. Faça o upgrade para continuar!');
    }
    const linkCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const linkCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existing = await this.prisma.telegramLink.findUnique({ where: { userId } });
    if (existing) {
      await this.prisma.telegramLink.update({
        where: { userId },
        data: { linkCode, linkCodeExpiresAt },
      });
    } else {
      await this.prisma.telegramLink.create({
        data: { userId, linkCode, linkCodeExpiresAt },
      });
    }
    return { linkCode, expiresAt: linkCodeExpiresAt.toISOString() };
  }

  async linkAccount(code: string, chatId: number) {
    const cleanCode = code ? code.trim().toUpperCase() : '';
    console.log(`[Telegram Link] Tentativa de vínculo com código '${cleanCode}' para chatId ${chatId}`);

    const link = await this.prisma.telegramLink.findFirst({ where: { linkCode: cleanCode } });

    if (!link) {
      console.warn(`[Telegram Link Error] Código '${cleanCode}' não encontrado no banco.`);
      throw new BadRequestException('Código de vínculo não encontrado. Verifique se digitou corretamente ou gere um novo no app.');
    }

    if (!link.linkCodeExpiresAt || link.linkCodeExpiresAt < new Date()) {
      console.warn(`[Telegram Link Error] Código '${cleanCode}' expirou em ${link.linkCodeExpiresAt}. Data atual: ${new Date()}`);
      throw new BadRequestException('Este código já expirou (válido por 10 min). Gere um novo no app em Perfil → Telegram.');
    }

    await this.prisma.telegramLink.update({
      where: { id: link.id },
      data: {
        telegramChatId: BigInt(chatId),
        linkCode: null,
        linkCodeExpiresAt: null,
        linkedAt: new Date(),
      },
    });

    console.log(`[Telegram Link Success] Conta do usuário ${link.userId} vinculada com sucesso ao chatId ${chatId}!`);
    await this.audit.log(link.userId, 'telegram_link', {}, { chatId });
    return { success: true, userId: link.userId };
  }

  async unlinkAccount(userId: string) {
    const link = await this.prisma.telegramLink.findUnique({ where: { userId } });
    if (link) {
      await this.prisma.telegramLink.update({
        where: { userId },
        data: {
          telegramChatId: null,
          linkCode: null,
          linkCodeExpiresAt: null,
          linkedAt: null,
        },
      });
      await this.audit.log(userId, 'telegram_unlink', {});
    }
    return { success: true };
  }

  async getUserByChatId(chatId: number) {
    const link = await this.prisma.telegramLink.findFirst({
      where: { telegramChatId: BigInt(chatId) },
      include: { user: true },
    });
    if (!link || !link.userId) return null;
    return {
      userId: link.userId,
      user: { id: link.user.id, name: link.user.name, email: link.user.email },
    };
  }

  async getSummaryByChatId(chatId: number) {
    const link = await this.prisma.telegramLink.findFirst({ where: { telegramChatId: BigInt(chatId) } });
    if (!link) throw new UnauthorizedException('Conta não vinculada');

    const user = await this.prisma.user.findUnique({
      where: { id: link.userId },
      select: { creditCardLimit: true },
    });

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allTxs, currentTxs] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId: link.userId, deletedAt: null },
      }),
      this.prisma.transaction.findMany({
        where: { userId: link.userId, deletedAt: null, date: { gte: firstDayCurrentMonth } },
      }),
    ]);

    let currentBalance = 0;
    allTxs.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        currentBalance += amt;
      } else if (t.type === 'expense' && t.paymentMethod !== 'credit') {
        // Apenas despesas no DÉBITO descontam do saldo de caixa acumulado
        currentBalance -= amt;
      }
    });

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

    const netMonth = totalIncome - totalDebitExpense;
    let status: 'surplus' | 'deficit' | 'balanced' = 'balanced';
    if (netMonth > 0) status = 'surplus';
    else if (netMonth < 0) status = 'deficit';

    const creditCardLimit = user?.creditCardLimit ? Number(user.creditCardLimit) : 0;
    const remainingLimit = Math.max(0, creditCardLimit - totalCreditExpense);
    const limitPercentage = creditCardLimit > 0 ? Math.round((totalCreditExpense / creditCardLimit) * 100) : 0;

    return {
      currentBalance,
      totalIncome,
      totalExpense,
      totalCreditExpense,
      totalDebitExpense,
      netMonth,
      status,
      creditCard: {
        limit: creditCardLimit,
        spent: totalCreditExpense,
        remaining: remainingLimit,
        percentage: limitPercentage,
      },
    };
  }

  async resetTransactionsByChatId(chatId: number) {
    const link = await this.prisma.telegramLink.findFirst({ where: { telegramChatId: BigInt(chatId) } });
    if (!link) throw new UnauthorizedException('Conta não vinculada');

    const result = await this.prisma.transaction.updateMany({
      where: { userId: link.userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    await this.audit.log(link.userId, 'bot_transactions_reset', {}, { count: result.count });
    return { success: true, resetCount: result.count };
  }

  async createTransaction(chatId: number, dto: any) {
    const link = await this.prisma.telegramLink.findFirst({ where: { telegramChatId: BigInt(chatId) } });
    if (!link) throw new UnauthorizedException('Conta não vinculada');

    const installmentsCount = dto.installmentsCount && dto.installmentsCount > 1 ? Number(dto.installmentsCount) : 1;
    const paymentMethod = dto.paymentMethod || (installmentsCount > 1 ? 'credit' : 'debit');

    if (installmentsCount > 1) {
      const user = await this.prisma.user.findUnique({
        where: { id: link.userId },
        select: { plan: true },
      });

      if (user?.plan !== 'pro') {
        throw new ForbiddenException('🔒 O parcelamento de compras (ex: 5x, 10x) é um recurso exclusivo do Plano PRO. Acesse economizeja.com.br/pro para fazer o upgrade!');
      }

      const installmentGroup = crypto.randomUUID();
      const baseDate = new Date(dto.date);
      const baseDescription = dto.description || 'Compra Parcelada';
      const totalAmount = Number(dto.amount);
      const installmentAmount = Number((totalAmount / installmentsCount).toFixed(2));

      const transactionsData: any[] = [];
      for (let i = 0; i < installmentsCount; i++) {
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        transactionsData.push({
          userId: link.userId,
          type: dto.type,
          paymentMethod,
          installmentsCount,
          installmentNumber: i + 1,
          installmentGroup,
          amount: installmentAmount,
          date,
          description: `${baseDescription} (${i + 1}/${installmentsCount})`,
          source: (dto.source as any) || 'bot_free',
        });
      }

      await this.prisma.transaction.createMany({
        data: transactionsData,
      });

      const tx = await this.prisma.transaction.findFirst({
        where: { userId: link.userId, installmentGroup, installmentNumber: 1 },
      });

      await this.audit.log(link.userId, 'bot_transaction_created_installments', {}, { count: installmentsCount });

      return {
        id: tx?.id,
        type: dto.type,
        amount: installmentAmount,
        description: dto.description,
        date: dto.date,
        installmentsCount,
        creditCardAlert: null,
      };
    }

    const tx = await this.prisma.transaction.create({
      data: {
        userId: link.userId,
        type: dto.type,
        paymentMethod: dto.paymentMethod || 'debit',
        installmentsCount: 1,
        installmentNumber: 1,
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description,
        source: (dto.source as any) || 'bot_free',
      },
    });

    await this.audit.log(link.userId, 'bot_transaction_created', {}, { txId: tx.id });

    // Verificar se atingiu limite do cartão de crédito (apenas para despesas no cartão)
    let creditCardAlert: string | null = null;
    if (dto.type === 'expense' && dto.paymentMethod === 'credit') {
      const user = await this.prisma.user.findUnique({
        where: { id: link.userId },
        select: { creditCardLimit: true },
      });
      const limit = user?.creditCardLimit ? Number(user.creditCardLimit) : 0;

      if (limit > 0) {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const creditExpenses = await this.prisma.transaction.aggregate({
          where: {
            userId: link.userId,
            type: 'expense',
            paymentMethod: 'credit',
            deletedAt: null,
            date: { gte: firstDayCurrentMonth }
          },
          _sum: { amount: true },
        });

        const totalCreditSpent = Number(creditExpenses._sum.amount || 0);
        const pct = Math.round((totalCreditSpent / limit) * 100);
        const remaining = Math.max(0, limit - totalCreditSpent);

        if (totalCreditSpent > limit) {
          creditCardAlert = `🚨 *ALERTA DE LIMITE EXCEDIDO!* Você ultrapassou seu limite de cartão em R$ ${(totalCreditSpent - limit).toFixed(2)}. Gastos no Cartão: R$ ${totalCreditSpent.toFixed(2)} de R$ ${limit.toFixed(2)}.`;
        } else if (pct >= 90) {
          creditCardAlert = `⚠️ *Atenção:* Você atingiu *${pct}%* do seu limite de cartão de crédito. Restam apenas R$ ${remaining.toFixed(2)} disponíveis!`;
        } else if (pct >= 70) {
          creditCardAlert = `💡 *Aviso de Limite:* Você já utilizou *${pct}%* do seu limite de cartão de crédito. Restam R$ ${remaining.toFixed(2)}.`;
        }
      }
    }

    return {
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      description: tx.description,
      date: tx.date.toISOString(),
      creditCardAlert,
    };
  }
}
