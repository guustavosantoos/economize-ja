import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { VerifyEmailDto, ResendCodeDto } from './dto/verify-email.dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Criar nova conta de usuário (Envia código de 6 dígitos)' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'E-mail já cadastrado ou dados inválidos' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Validar código de 6 dígitos enviado por e-mail' })
  @ApiResponse({ status: 200, description: 'E-mail validado e login efetuado com sucesso' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.verifyEmailCode(dto, req);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { data: { accessToken, user } };
  }

  @Public()
  @Post('resend-code')
  @ApiOperation({ summary: 'Reenviar código de 6 dígitos por e-mail' })
  resendCode(@Body() dto: ResendCodeDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('login')
  @ApiOperation({ summary: 'Fazer login e obter JWT access token' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso (retorna accessToken e salva cookie refresh_token)' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto, req);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { data: { accessToken } };
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 15 * 60 * 1000 } })
  @Post('google')
  @ApiOperation({ summary: 'Login / Cadastro automático via Google / Gmail' })
  @ApiResponse({ status: 200, description: 'Login via Google efetuado com sucesso' })
  async googleAuth(@Body() dto: GoogleAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.googleAuth(dto, req);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { data: { accessToken, user } };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando cookie httpOnly refresh_token' })
  @ApiResponse({ status: 200, description: 'Novo accessToken gerado' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) return { data: null };
    const { accessToken, refreshToken } = await this.authService.refresh(token, req);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { data: { accessToken } };
  }
}
