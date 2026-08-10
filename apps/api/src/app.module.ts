import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TelegramModule } from './telegram/telegram.module';
import { BillsModule } from './bills/bills.module';
import { OpenFinanceModule } from './open-finance/open-finance.module';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';
import { PaymentsModule } from './payments/payments.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Safe 100 reqs/min rate limit to prevent brute force
    }]),
    PrismaModule,
    AuditModule,
    MailModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
    TelegramModule,
    BillsModule,
    OpenFinanceModule,
    AiModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule {}
