import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { BillRecurrence } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiProperty({
    example: 'Conta de Luz',
    description: 'Nome da conta a pagar',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 145.90,
    description: 'Valor aproximado da conta',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 10,
    description: 'Dia do mês do vencimento (1 a 31)',
  })
  @IsNumber()
  dueDay: number;

  @ApiProperty({
    enum: BillRecurrence,
    example: BillRecurrence.monthly,
    description: 'Recorrência da conta: once, monthly ou yearly',
  })
  @IsEnum(BillRecurrence)
  recurrence: BillRecurrence;

  @ApiProperty({
    example: '2026-09-10',
    description: 'Data do próximo vencimento (YYYY-MM-DD)',
  })
  @IsString()
  nextDueDate: string;

  @ApiPropertyOptional({
    example: 'uuid-da-categoria',
    description: 'ID da categoria (opcional)',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
