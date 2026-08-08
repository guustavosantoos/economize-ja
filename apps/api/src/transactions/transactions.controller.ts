import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova transação (despesa, receita ou transferência)' })
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Zerar todas as transações do usuário (Começar do zero)' })
  resetAll(@CurrentUser() user: any, @Req() req: any) {
    return this.transactionsService.resetTransactions(user.id, req);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações do usuário com filtros opcionais de data' })
  findAll(@CurrentUser() user: any, @Query() filter: FilterTransactionDto) {
    return this.transactionsService.findAll(user.id, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma transação específica' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma transação' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma transação (soft delete)' })
  remove(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    return this.transactionsService.remove(user.id, id, req);
  }
}
