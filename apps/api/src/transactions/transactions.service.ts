import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const installmentsCount = dto.installmentsCount && dto.installmentsCount > 1 ? Number(dto.installmentsCount) : 1;
    const paymentMethod = dto.paymentMethod || (installmentsCount > 1 ? 'credit' : 'debit');

    if (installmentsCount > 1) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (user?.plan !== 'pro') {
        throw new ForbiddenException('O recurso de compras parceladas (ex: 2x a 24x) é exclusivo para assinantes do Plano PRO. Acesse /pro para fazer o upgrade!');
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
          userId,
          type: dto.type,
          paymentMethod,
          installmentsCount,
          installmentNumber: i + 1,
          installmentGroup,
          amount: installmentAmount,
          date,
          categoryId: dto.categoryId,
          description: `${baseDescription} (${i + 1}/${installmentsCount})`,
        });
      }

      await this.prisma.transaction.createMany({
        data: transactionsData,
      });

      return this.prisma.transaction.findFirst({
        where: { userId, installmentGroup, installmentNumber: 1 },
        include: { category: true },
      });
    }

    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        paymentMethod,
        installmentsCount: 1,
        installmentNumber: 1,
        amount: dto.amount,
        date: new Date(dto.date),
        categoryId: dto.categoryId,
        description: dto.description,
      },
    });
  }

  findAll(userId: string, filter: FilterTransactionDto) {
    const where: any = { userId, deletedAt: null };
    if (filter.startDate || filter.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = new Date(filter.startDate);
      if (filter.endDate) where.date.lte = new Date(filter.endDate);
    }
    // Sort by createdAt desc so the most recently added transaction always appears first
    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  }

  update(userId: string, id: string, dto: UpdateTransactionDto) {
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string, req: any) {
    await this.audit.log(userId, 'transaction_delete', req, { transactionId: id });
    return this.prisma.transaction.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  async resetTransactions(userId: string, req?: any) {
    if (req) {
      await this.audit.log(userId, 'transactions_reset_all', req);
    }
    const count = await this.prisma.transaction.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { success: true, resetCount: count.count };
  }
}
