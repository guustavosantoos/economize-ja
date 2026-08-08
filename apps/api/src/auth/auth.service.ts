import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private audit: AuditService,
    private mail: MailService,
    private config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('E-mail já está em uso');

    const passwordHash = await argon2.hash(dto.password, { memoryCost: 65536, timeCost: 3, parallelism: 4 });
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
    });
    
    // Gerar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Válido por 15 minutos
      },
    });

    // Enviar e-mail com o código de 6 dígitos
    await this.mail.sendEmail(
      user.email,
      'Seu código de confirmação — Economize Já',
      `Olá ${user.name},\n\nSeu código de verificação para o Economize Já é:\n\n👉 ${code}\n\nEste código é válido por 15 minutos.`
    );
    
    return { message: 'Cadastrado com sucesso', data: { id: user.id, email: user.email } };
  }

  async verifyEmailCode(dto: VerifyEmailDto, req: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const codeHash = crypto.createHash('sha256').update(dto.code).digest('hex');
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        tokenHash: codeHash,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Código de verificação incorreto ou já utilizado');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Código de verificação expirado. Solicite um novo.');
    }

    // Marcar como verificado e usado
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.audit.log(user.id, 'email_verified_success', req);

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });
    const refreshToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        family: uuidv4(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } };
  }

  async resendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.mail.sendEmail(
      user.email,
      'Seu novo código de confirmação — Economize Já',
      `Olá ${user.name},\n\nSeu novo código de verificação é:\n\n👉 ${code}\n\nVálido por 15 minutos.`
    );

    return { message: 'Novo código enviado com sucesso' };
  }

  async login(dto: LoginDto, req: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.deletedAt) {
        await this.audit.log(null, 'login_failed', req, { email: dto.email });
        throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
        await this.audit.log(user.id, 'login_failed', req, { email: dto.email });
        throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.audit.log(user.id, 'login_success', req);

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });
    const refreshToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const family = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        family,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    return { accessToken, refreshToken };
  }

  async googleAuth(dto: { email: string; name?: string; googleId?: string; credential?: string }, req: any) {
    if (!dto.email) throw new BadRequestException('E-mail do Google é obrigatório');

    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      const passwordHash = await argon2.hash(uuidv4(), { memoryCost: 65536, timeCost: 3, parallelism: 4 });
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name || dto.email.split('@')[0],
          passwordHash,
          emailVerified: true,
        },
      });
    } else if (user.deletedAt) {
      throw new UnauthorizedException('Conta desativada');
    } else if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    await this.audit.log(user.id, 'google_login_success', req, { email: user.email });

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });
    const refreshToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const family = uuidv4();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        family,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string, req: any) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenDoc = await this.prisma.refreshToken.findFirst({
        where: { tokenHash }
    });

    if (!tokenDoc) throw new UnauthorizedException('Refresh token inválido');

    if (tokenDoc.revokedAt) {
        await this.prisma.refreshToken.updateMany({
            where: { family: tokenDoc.family },
            data: { revokedAt: new Date() }
        });
        throw new UnauthorizedException('Token revogado');
    }

    if (tokenDoc.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expirado');
    }

    await this.prisma.refreshToken.update({
        where: { id: tokenDoc.id },
        data: { revokedAt: new Date() }
    });

    const user = await this.prisma.user.findUnique({ where: { id: tokenDoc.userId }});
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });
    const newRefreshToken = uuidv4();
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        family: tokenDoc.family,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
