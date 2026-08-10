import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        creditCardLimit: true,
        createdAt: true,
      },
    });
    return {
      ...user,
      creditCardLimit: user?.creditCardLimit ? Number(user.creditCardLimit) : null,
    };
  }

  async update(userId: string, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (dto.creditCardLimit !== undefined && dto.creditCardLimit > 0 && existingUser?.plan !== 'pro') {
      throw new ForbiddenException('A definição de meta/limite do cartão de crédito é um recurso exclusivo do Plano PRO. Acesse /pro para fazer o upgrade!');
    }

    const dataToUpdate: any = {};
    if (dto.name !== undefined) dataToUpdate.name = dto.name;
    if (dto.creditCardLimit !== undefined) dataToUpdate.creditCardLimit = dto.creditCardLimit;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, plan: true, creditCardLimit: true },
    });

    return {
      ...user,
      creditCardLimit: user.creditCardLimit ? Number(user.creditCardLimit) : null,
    };
  }

  async exportData(userId: string, req: any) {
    await this.audit.log(userId, 'data_export', req);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const transactions = await this.prisma.transaction.findMany({ where: { userId } });
    const categories = await this.prisma.category.findMany({ where: { userId } });
    const telegramLink = await this.prisma.telegramLink.findUnique({ where: { userId } });
    return { user, transactions, categories, telegramLink };
  }

  async deleteAccount(userId: string, req: any) {
    await this.audit.log(userId, 'account_delete', req);
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}
