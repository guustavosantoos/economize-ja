import { Controller, Post, Get, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class LinkTelegramDto {
  @ApiProperty({ example: 'AB12CD34', description: 'Código alfanumérico gerado no app' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 123456789, description: 'ID numérico do chat Telegram' })
  @IsNumber()
  @IsNotEmpty()
  chatId: number;

  @ApiProperty({ example: 'usuario_telegram', required: false, description: 'Username do Telegram (opcional)' })
  @IsString()
  @IsOptional()
  telegramUsername?: string;
}

export class InternalCreateTransactionDto {
  @ApiProperty({ example: 123456789, description: 'ID do chat Telegram' })
  @IsNumber()
  @IsNotEmpty()
  chatId: number;

  @ApiProperty({ example: 'expense', enum: ['expense', 'income', 'transfer'], description: 'Tipo da transação' })
  @IsEnum(['expense', 'income', 'transfer'])
  @IsNotEmpty()
  type: 'expense' | 'income' | 'transfer';

  @ApiProperty({ example: 55.0, description: 'Valor numérico em Reais' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Uber viagem', description: 'Descrição da transação' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2026-08-07', description: 'Data YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'bot_free', required: false, description: 'Origem da transação' })
  @IsString()
  @IsOptional()
  source?: string;
}

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  private validateInternalSecret(req: any) {
    const secret = process.env.INTERNAL_API_SECRET;
    const headerSecret = req.headers['x-internal-secret'];
    if (secret && secret.trim() !== '' && secret !== 'change-me' && headerSecret) {
      if (headerSecret !== secret) {
        throw new UnauthorizedException('Acesso não autorizado a rotas internas (INTERNAL_API_SECRET incompatível)');
      }
    }
  }

  @ApiBearerAuth('access-token')
  @Get('status')
  @ApiOperation({ summary: 'Obter status de vinculação do usuário logado' })
  getStatus(@CurrentUser() user: any) {
    return this.telegramService.getLinkStatus(user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('link-code')
  @ApiOperation({ summary: 'Gerar código temporário (10 min) para vincular a conta no Telegram' })
  generateLinkCode(@CurrentUser() user: any) {
    return this.telegramService.generateLinkCode(user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('unlink')
  @ApiOperation({ summary: 'Desvincular conta do Telegram' })
  unlinkAccount(@CurrentUser() user: any) {
    return this.telegramService.unlinkAccount(user.id);
  }

  @Public()
  @Get('internal/user-by-chat/:chatId')
  @ApiOperation({ summary: '[Bot Interno] Obter usuário vinculado por chatId' })
  getUserByChatId(@Param('chatId') chatId: string, @Req() req: any) {
    this.validateInternalSecret(req);
    return this.telegramService.getUserByChatId(Number(chatId));
  }

  @Public()
  @Get('internal/summary/:chatId')
  @ApiOperation({ summary: '[Bot Interno] Obter resumo financeiro do mês por chatId' })
  getSummaryByChatId(@Param('chatId') chatId: string, @Req() req: any) {
    this.validateInternalSecret(req);
    return this.telegramService.getSummaryByChatId(Number(chatId));
  }

  @Public()
  @Post('internal/link')
  @ApiOperation({ summary: '[Bot Interno] Vincular chatId do Telegram usando código' })
  linkAccount(@Body() dto: LinkTelegramDto, @Req() req: any) {
    this.validateInternalSecret(req);
    return this.telegramService.linkAccount(dto.code, Number(dto.chatId));
  }

  @Public()
  @Post('internal/reset')
  @ApiOperation({ summary: '[Bot Interno] Zerar todas as transações do usuário por chatId' })
  resetTransactions(@Body('chatId') chatId: number, @Req() req: any) {
    this.validateInternalSecret(req);
    return this.telegramService.resetTransactionsByChatId(Number(chatId));
  }

  @Public()
  @Post('internal/create-transaction')
  @ApiOperation({ summary: '[Bot Interno] Lançar transação enviada pelo bot Telegram' })
  createTransaction(@Body() dto: InternalCreateTransactionDto, @Req() req: any) {
    this.validateInternalSecret(req);
    return this.telegramService.createTransaction(Number(dto.chatId), dto);
  }
}
