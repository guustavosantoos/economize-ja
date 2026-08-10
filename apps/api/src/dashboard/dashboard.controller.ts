import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro do mês (saldo, total de receitas, total de despesas, meta de cartão e % de variação)' })
  getSummary(@CurrentUser() user: any, @Query('month') month?: string) {
    return this.dashboardService.getSummary(user.id, month);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obter dados diários do mês para exibição no Calendário Financeiro' })
  getCalendar(@CurrentUser() user: any, @Query('month') month?: string) {
    return this.dashboardService.getCalendar(user.id, month);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Distribuição de despesas agrupadas por categoria (dados para gráfico Donut)' })
  getByCategory(@CurrentUser() user: any, @Query('month') month?: string) {
    return this.dashboardService.getByCategory(user.id, month);
  }

  @Get('monthly-evolution')
  @ApiOperation({ summary: 'Evolução dos últimos 12 meses (dados para gráfico de barras)' })
  getMonthlyEvolution(@CurrentUser() user: any) {
    return this.dashboardService.getMonthlyEvolution(user.id);
  }
}
