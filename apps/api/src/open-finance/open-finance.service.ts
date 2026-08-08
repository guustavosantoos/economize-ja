import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenFinanceProvider } from './interfaces/open-finance-provider.interface';

@Injectable()
export class OpenFinanceService implements OpenFinanceProvider {
  constructor(private prisma: PrismaService) {}

  async createConnection(userId: string) {
    return { connectUrl: 'https://mock.url', itemId: 'mock-item' };
  }

  async syncTransactions(connectionId: string) {
    return [];
  }

  async revokeConsent(connectionId: string) {
    return;
  }
  
  getConnections(user: any) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.openFinanceConnection.findMany({ where: { userId: user.id } });
  }
}
