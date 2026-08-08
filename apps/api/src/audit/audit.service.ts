import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, action: string, req: any = {}, metadata: any = {}) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress: req.ip || null,
        userAgent: req.headers ? req.headers['user-agent'] : null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  }
}
