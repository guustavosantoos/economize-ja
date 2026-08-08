import { Module } from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { OpenFinanceController } from './open-finance.controller';

@Module({
  controllers: [OpenFinanceController],
  providers: [OpenFinanceService]
})
export class OpenFinanceModule {}
