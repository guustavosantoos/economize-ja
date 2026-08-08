import { Controller, Get, Post, Body } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Bills')
@ApiBearerAuth('access-token')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: '[Plano Pro] Cadastrar lembrete de conta a pagar' })
  create(@CurrentUser() user: any, @Body() dto: CreateBillDto) {
    return this.billsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: '[Plano Pro] Listar contas a pagar agendadas' })
  findAll(@CurrentUser() user: any) {
    return this.billsService.findAll(user);
  }
}
