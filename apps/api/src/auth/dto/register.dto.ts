import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'novo.usuario@economizeja.com',
    description: 'E-mail do novo usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'SenhaSegura@123',
    description: 'Senha (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
