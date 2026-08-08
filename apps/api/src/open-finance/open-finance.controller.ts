import { Controller, Get } from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Open Finance')
@ApiBearerAuth('access-token')
@Controller('open-finance')
export class OpenFinanceController {
  constructor(private readonly openFinanceService: OpenFinanceService) {}

  @Get()
  @ApiOperation({ summary: '[Plano Pro] Listar conexões de sincronização bancária Open Finance' })
  getConnections(@CurrentUser() user: any) {
    return this.openFinanceService.getConnections(user);
  }
}
