import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateBillDto) {
    if (user.plan !== 'pro') {
      throw new ForbiddenException('O recurso de lembretes de contas a pagar é exclusivo do Plano PRO. Faça o upgrade para continuar!');
    }

    return this.prisma.bill.create({
      data: {
        name: dto.name,
        amount: dto.amount,
        dueDay: dto.dueDay,
        recurrence: dto.recurrence,
        nextDueDate: new Date(dto.nextDueDate),
        categoryId: dto.categoryId || null,
        userId: user.id,
      },
      include: { category: true },
    });
  }

  async findAll(user: any) {
    if (user.plan !== 'pro') {
      throw new ForbiddenException('O recurso de lembretes de contas a pagar é exclusivo do Plano PRO. Faça o upgrade para continuar!');
    }

    const bills = await this.prisma.bill.findMany({
      where: { userId: user.id, isActive: true },
      include: { category: true },
      orderBy: { nextDueDate: 'asc' },
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return bills.map((bill) => {
      const dueStr = bill.nextDueDate.toISOString().split('T')[0];
      let status: 'overdue' | 'today' | 'pending' = 'pending';

      if (dueStr < todayStr) status = 'overdue';
      else if (dueStr === todayStr) status = 'today';

      return {
        ...bill,
        amount: Number(bill.amount),
        status,
      };
    });
  }

  async payBill(user: any, id: string) {
    if (user.plan !== 'pro') {
      throw new ForbiddenException('O recurso de lembretes de contas a pagar é exclusivo do Plano PRO.');
    }

    const bill = await this.prisma.bill.findFirst({
      where: { id, userId: user.id, isActive: true },
    });

    if (!bill) throw new NotFoundException('Conta a pagar não encontrada.');

    // 1. Criar transação de despesa referente ao pagamento
    await this.prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'expense',
        paymentMethod: 'debit',
        amount: bill.amount,
        description: `Pagamento: ${bill.name}`,
        date: new Date(),
        categoryId: bill.categoryId,
        source: 'web',
      },
    });

    // 2. Incrementar próximo vencimento conforme a recorrência ou inativar se 'once'
    if (bill.recurrence === ('once' as any)) {
      return this.prisma.bill.update({
        where: { id },
        data: { isActive: false },
        include: { category: true },
      });
    }

    const nextDate = new Date(bill.nextDueDate);
    if (bill.recurrence === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (bill.recurrence === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 7);
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        nextDueDate: nextDate,
      },
      include: { category: true },
    });
  }

  async remove(user: any, id: string) {
    if (user.plan !== 'pro') {
      throw new ForbiddenException('O recurso de lembretes de contas a pagar é exclusivo do Plano PRO.');
    }

    return this.prisma.bill.updateMany({
      where: { id, userId: user.id },
      data: { isActive: false },
    });
  }
}
