import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
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
