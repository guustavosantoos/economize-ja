import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'teste@economizeja.com',
    description: 'E-mail cadastrado',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Test@1234',
    description: 'Senha do usuário',
  })
  @IsString()
  password: string;
}
