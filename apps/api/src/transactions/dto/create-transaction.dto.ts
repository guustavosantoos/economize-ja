import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.expense,
    description: 'Tipo da transação: expense (despesa), income (receita), ou transfer (transferência)',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 85.50,
    description: 'Valor numérico da transação em Reais (BRL)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: '2026-08-07',
    description: 'Data no formato ISO (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 'Supermercado Mensal',
    description: 'Descrição ou nome da transação',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'uuid-da-categoria-aqui',
    description: 'ID da categoria associada (opcional)',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'credit',
    description: 'Método de pagamento: credit ou debit',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Número total de parcelas (opcional, padrão 1)',
  })
  @IsNumber()
  @IsOptional()
  installmentsCount?: number;
}
