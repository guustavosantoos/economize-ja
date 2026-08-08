import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTransactionDto {
  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Data inicial para o filtro (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-31',
    description: 'Data final para o filtro (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
