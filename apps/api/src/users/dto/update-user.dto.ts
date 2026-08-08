import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'João da Silva',
    description: 'Novo nome do usuário',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 2000.0,
    description: 'Limite mensal do cartão de crédito em R$',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditCardLimit?: number;
}
