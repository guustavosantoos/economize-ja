import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'usuario@gmail.com', description: 'E-mail do usuário' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Código numérico de 6 dígitos enviado por e-mail' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'O código deve conter exatamente 6 dígitos' })
  code: string;
}

export class ResendCodeDto {
  @ApiProperty({ example: 'usuario@gmail.com', description: 'E-mail do usuário' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
