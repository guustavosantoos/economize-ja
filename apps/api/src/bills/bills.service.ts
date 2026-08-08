import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  create(user: any, dto: CreateBillDto) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.bill.create({
      data: {
        ...dto,
        nextDueDate: new Date(dto.nextDueDate),
        userId: user.id
      }
    });
  }

  findAll(user: any) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.bill.findMany({ where: { userId: user.id } });
  }
}
