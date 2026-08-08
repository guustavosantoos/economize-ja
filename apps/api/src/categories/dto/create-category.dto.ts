import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Assinaturas & Streaming',
    description: 'Nome da nova categoria',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.expense,
    description: 'Tipo da categoria: expense ou income',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    example: 'subscriptions',
    description: 'Nome do ícone Material Symbol',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    example: '#8B5CF6',
    description: 'Cor em formato HEX',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
