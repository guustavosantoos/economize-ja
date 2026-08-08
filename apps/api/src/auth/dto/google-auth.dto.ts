import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: 'usuario@gmail.com', description: 'E-mail da conta do Google' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Nome do Usuário', required: false, description: 'Nome retornado pelo Google' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'google-sub-id', required: false, description: 'ID da conta do Google' })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({ example: 'jwt-credential-token', required: false, description: 'Token de credencial do Google' })
  @IsString()
  @IsOptional()
  credential?: string;
}
