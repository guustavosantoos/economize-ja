import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
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

  @Post(':id/pay')
  @ApiOperation({ summary: '[Plano Pro] Marcar conta como paga (gera despesa no histórico)' })
  payBill(@CurrentUser() user: any, @Param('id') id: string) {
    return this.billsService.payBill(user, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[Plano Pro] Remover conta a pagar' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.billsService.remove(user, id);
  }
}
