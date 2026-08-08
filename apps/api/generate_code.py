import os

base_dir = "/Users/gustavobraulio/Desktop/EconomizeJá/apps/api"
src_dir = os.path.join(base_dir, "src")

files = {
    "src/main.ts": """import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  
  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  app.setGlobalPrefix('api/v1');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api/v1`);
}
bootstrap();
""",
    
    "src/app.module.ts": """import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TelegramModule } from './telegram/telegram.module';
import { BillsModule } from './bills/bills.module';
import { OpenFinanceModule } from './open-finance/open-finance.module';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 15 * 60 * 1000,
      limit: 100,
    }]),
    PrismaModule,
    AuditModule,
    MailModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
    TelegramModule,
    BillsModule,
    OpenFinanceModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule {}
""",

    "src/prisma/prisma.service.ts": """import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
""",

    "src/prisma/prisma.module.ts": """import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
""",

    "src/common/decorators/current-user.decorator.ts": """import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
""",

    "src/common/decorators/public.decorator.ts": """import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
""",

    "src/common/guards/jwt-auth.guard.ts": """import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
""",

    "src/common/filters/http-exception.filter.ts": """import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      data: null,
      message: typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as any).message || exception.message
          : exception.message,
      error: typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as any).error
          : null,
      statusCode: status,
    });
  }
}
""",

    "src/common/interceptors/transform.interceptor.ts": """import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => {
        if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
            return data;
        }
        if (data && typeof data === 'object' && 'data' in data) {
            return { data: data.data, message: data.message };
        }
        return { data: data, message: 'Success' }
    }));
  }
}
""",

    "src/audit/audit.service.ts": """import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, action: string, req: any = {}, metadata: any = {}) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress: req.ip || null,
        userAgent: req.headers ? req.headers['user-agent'] : null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  }
}
""",

    "src/audit/audit.module.ts": """import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
""",

    "src/mail/mail.service.ts": """import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resend: Resend;
  
  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY') || 'mock');
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (this.configService.get('NODE_ENV') === 'test') return;
    try {
       await this.resend.emails.send({
        from: 'Economize Já <noreply@economizeja.com>',
        to,
        subject,
        html,
      });
    } catch(e) {
        console.error('Email failed', e);
    }
  }
}
""",

    "src/mail/mail.module.ts": """import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
""",

    "src/auth/dto/register.dto.ts": """import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
""",

    "src/auth/dto/login.dto.ts": """import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
""",

    "src/auth/strategies/jwt.strategy.ts": """import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.deletedAt) throw new UnauthorizedException();
    return { id: user.id, email: user.email, plan: user.plan };
  }
}
""",

    "src/auth/strategies/jwt-refresh.strategy.ts": """import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub };
  }
}
""",

    "src/auth/guards/jwt-refresh.guard.ts": """import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
""",

    "src/auth/auth.service.ts": """import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
    if (existingUser) throw new BadRequestException('Email already in use');

    const passwordHash = await argon2.hash(dto.password, { memoryCost: 65536, timeCost: 3, parallelism: 4 });
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
    });
    
    // Generate verification token
    const token = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Send email
    await this.mail.sendEmail(user.email, 'Verify your email', `Your code is ${token}`);
    
    return { message: 'Registered successfully', data: { id: user.id } };
  }

  async login(dto: LoginDto, req: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.deletedAt) {
        await this.audit.log(null, 'login_failed', req, { email: dto.email });
        throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
        await this.audit.log(user.id, 'login_failed', req, { email: dto.email });
        throw new UnauthorizedException('Invalid credentials');
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

  async refresh(refreshToken: string, req: any) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const tokenDoc = await this.prisma.refreshToken.findFirst({
        where: { tokenHash }
    });

    if (!tokenDoc) throw new UnauthorizedException('Invalid refresh token');

    if (tokenDoc.revokedAt) {
        // Token reuse detected - revoke all in family
        await this.prisma.refreshToken.updateMany({
            where: { family: tokenDoc.family },
            data: { revokedAt: new Date() }
        });
        throw new UnauthorizedException('Token revoked');
    }

    if (tokenDoc.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
    }

    // Revoke current
    await this.prisma.refreshToken.update({
        where: { id: tokenDoc.id },
        data: { revokedAt: new Date() }
    });

    const user = await this.prisma.user.findUnique({ where: { id: tokenDoc.userId }});
    if (!user) throw new UnauthorizedException('User not found');

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
""",

    "src/auth/auth.controller.ts": """import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto, req);
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
    return { data: { accessToken } };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const token = req.cookies?.refresh_token;
      if (!token) return { data: null };
      const { accessToken, refreshToken } = await this.authService.refresh(token, req);
      res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000
      });
      return { data: { accessToken } };
  }
}
""",

    "src/auth/auth.module.ts": """import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
""",

    "src/users/dto/update-user.dto.ts": """import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;
}
""",

    "src/users/users.service.ts": """import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, plan: true, createdAt: true }
    });
    return user;
  }

  async update(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: { id: true, email: true, name: true, plan: true }
    });
  }

  async exportData(userId: string, req: any) {
    await this.audit.log(userId, 'data_export', req);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const transactions = await this.prisma.transaction.findMany({ where: { userId } });
    const categories = await this.prisma.category.findMany({ where: { userId } });
    const telegramLink = await this.prisma.telegramLink.findUnique({ where: { userId } });
    return { user, transactions, categories, telegramLink };
  }

  async deleteAccount(userId: string, req: any) {
    await this.audit.log(userId, 'account_delete', req);
    await this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
    });
    return { success: true };
  }
}
""",

    "src/users/users.controller.ts": """import { Controller, Get, Put, Delete, Body, Req, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  update(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Post('me/export')
  exportData(@CurrentUser() user: any, @Req() req: any) {
    return this.usersService.exportData(user.id, req);
  }

  @Delete('me')
  deleteAccount(@CurrentUser() user: any, @Req() req: any) {
    return this.usersService.deleteAccount(user.id, req);
  }
}
""",

    "src/users/users.module.ts": """import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
""",

    "src/categories/dto/create-category.dto.ts": """import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
""",

    "src/categories/dto/update-category.dto.ts": """import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
""",

    "src/categories/categories.service.ts": """import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, userId }
    });
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] }
    });
  }

  update(userId: string, id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.updateMany({
      where: { id, userId },
      data: dto
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.category.deleteMany({
      where: { id, userId }
    });
  }
}
""",

    "src/categories/categories.controller.ts": """import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.id);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
""",

    "src/categories/categories.module.ts": """import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
""",

    "src/transactions/dto/create-transaction.dto.ts": """import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
""",

    "src/transactions/dto/update-transaction.dto.ts": """import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
""",

    "src/transactions/dto/filter-transaction.dto.ts": """import { IsOptional, IsString } from 'class-validator';

export class FilterTransactionDto {
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
}
""",

    "src/transactions/transactions.service.ts": """import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        categoryId: dto.categoryId,
        description: dto.description
      }
    });
  }

  findAll(userId: string, filter: FilterTransactionDto) {
    const where: any = { userId, deletedAt: null };
    if (filter.startDate || filter.endDate) {
        where.date = {};
        if (filter.startDate) where.date.gte = new Date(filter.startDate);
        if (filter.endDate) where.date.lte = new Date(filter.endDate);
    }
    return this.prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, include: { category: true } });
  }

  findOne(userId: string, id: string) {
    return this.prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  }

  update(userId: string, id: string, dto: UpdateTransactionDto) {
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.transaction.updateMany({
      where: { id, userId },
      data
    });
  }

  async remove(userId: string, id: string, req: any) {
    await this.audit.log(userId, 'transaction_delete', req, { transactionId: id });
    return this.prisma.transaction.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() }
    });
  }
}
""",

    "src/transactions/transactions.controller.ts": """import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() filter: FilterTransactionDto) {
    return this.transactionsService.findAll(user.id, filter);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    return this.transactionsService.remove(user.id, id, req);
  }
}
""",

    "src/transactions/transactions.module.ts": """import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService]
})
export class TransactionsModule {}
""",

    "src/dashboard/dashboard.service.ts": """import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [current, previous] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDay } }
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: firstDayLastMonth, lt: firstDay } }
      })
    ]);

    const calculate = (txs) => {
      let income = 0;
      let expense = 0;
      txs.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        else if (t.type === 'expense') expense += Number(t.amount);
      });
      return { income, expense, balance: income - expense };
    };

    const currentStats = calculate(current);
    const previousStats = calculate(previous);

    return {
      current: currentStats,
      previous: previousStats
    };
  }

  async getByCategory(userId: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const txs = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null, date: { gte: firstDay }, type: 'expense' },
      include: { category: true }
    });

    const groups = {};
    let total = 0;
    txs.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      if (!groups[catId]) groups[catId] = { category: t.category, amount: 0 };
      groups[catId].amount += Number(t.amount);
      total += Number(t.amount);
    });

    return Object.values(groups).map((g: any) => ({
      category: g.category,
      amount: g.amount,
      percentage: total > 0 ? (g.amount / total) * 100 : 0
    }));
  }

  async getMonthlyEvolution(userId: string) {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    const raw = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        type,
        SUM(amount) as amount
      FROM transactions
      WHERE user_id = ${userId} AND deleted_at IS NULL AND date >= ${oneYearAgo}
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    `;
    
    return raw;
  }
}
""",

    "src/dashboard/dashboard.controller.ts": """import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user.id);
  }

  @Get('by-category')
  getByCategory(@CurrentUser() user: any) {
    return this.dashboardService.getByCategory(user.id);
  }

  @Get('monthly-evolution')
  getMonthlyEvolution(@CurrentUser() user: any) {
    return this.dashboardService.getMonthlyEvolution(user.id);
  }
}
""",

    "src/dashboard/dashboard.module.ts": """import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
""",

    "src/telegram/telegram.service.ts": """import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TelegramService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async generateLinkCode(userId: string) {
    const linkCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const linkCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existing = await this.prisma.telegramLink.findUnique({ where: { userId } });
    if (existing) {
        await this.prisma.telegramLink.update({
            where: { userId },
            data: { linkCode, linkCodeExpiresAt }
        });
    } else {
        await this.prisma.telegramLink.create({
            data: { userId, linkCode, linkCodeExpiresAt }
        });
    }
    return { linkCode };
  }

  async linkAccount(code: string, chatId: number) {
    const link = await this.prisma.telegramLink.findUnique({ where: { linkCode: code } });
    if (!link || !link.linkCodeExpiresAt || link.linkCodeExpiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired code');
    }

    await this.prisma.telegramLink.update({
        where: { id: link.id },
        data: {
            telegramChatId: chatId,
            linkCode: null,
            linkCodeExpiresAt: null,
            linkedAt: new Date()
        }
    });

    await this.audit.log(link.userId, 'telegram_link', {}, { chatId });
    return { success: true, userId: link.userId };
  }

  async createTransaction(chatId: number, dto: any) {
    const link = await this.prisma.telegramLink.findUnique({ where: { telegramChatId: chatId } });
    if (!link) throw new UnauthorizedException('Unlinked chat');

    const tx = await this.prisma.transaction.create({
      data: {
        userId: link.userId,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description,
        source: 'bot_free',
      }
    });
    
    await this.audit.log(link.userId, 'bot_transaction_created', {}, { txId: tx.id });
    return tx;
  }
}
""",

    "src/telegram/telegram.controller.ts": """import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('link-code')
  generateLinkCode(@CurrentUser() user: any) {
    return this.telegramService.generateLinkCode(user.id);
  }

  @Public()
  @Post('internal/link')
  linkAccount(@Body() dto: { code: string, chatId: number }, @Req() req: any) {
    if (req.headers['x-internal-secret'] !== process.env.INTERNAL_API_SECRET) {
        throw new UnauthorizedException();
    }
    return this.telegramService.linkAccount(dto.code, dto.chatId);
  }

  @Public()
  @Post('internal/create-transaction')
  createTransaction(@Body() dto: any, @Req() req: any) {
    if (req.headers['x-internal-secret'] !== process.env.INTERNAL_API_SECRET) {
        throw new UnauthorizedException();
    }
    return this.telegramService.createTransaction(dto.chatId, dto);
  }
}
""",

    "src/telegram/telegram.module.ts": """import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService]
})
export class TelegramModule {}
""",

    "src/bills/dto/create-bill.dto.ts": """import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { BillRecurrence } from '@prisma/client';

export class CreateBillDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  dueDay: number;

  @IsEnum(BillRecurrence)
  recurrence: BillRecurrence;

  @IsString()
  nextDueDate: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
""",

    "src/bills/bills.service.ts": """import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  create(user: any, dto: CreateBillDto) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.bill.create({
      data: {
        ...dto,
        nextDueDate: new Date(dto.nextDueDate),
        userId: user.id
      }
    });
  }

  findAll(user: any) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.bill.findMany({ where: { userId: user.id } });
  }
}
""",

    "src/bills/bills.controller.ts": """import { Controller, Get, Post, Body } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBillDto) {
    return this.billsService.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.billsService.findAll(user);
  }
}
""",

    "src/bills/bills.module.ts": """import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';

@Module({
  controllers: [BillsController],
  providers: [BillsService]
})
export class BillsModule {}
""",

    "src/open-finance/interfaces/open-finance-provider.interface.ts": """export interface OpenFinanceProvider {
  createConnection(userId: string): Promise<{ connectUrl: string; itemId: string }>;
  syncTransactions(connectionId: string): Promise<any[]>;
  revokeConsent(connectionId: string): Promise<void>;
}
""",

    "src/open-finance/open-finance.service.ts": """import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenFinanceProvider } from './interfaces/open-finance-provider.interface';

@Injectable()
export class OpenFinanceService implements OpenFinanceProvider {
  constructor(private prisma: PrismaService) {}

  async createConnection(userId: string) {
    return { connectUrl: 'https://mock.url', itemId: 'mock-item' };
  }

  async syncTransactions(connectionId: string) {
    return [];
  }

  async revokeConsent(connectionId: string) {
    return;
  }
  
  getConnections(user: any) {
    if (user.plan !== 'pro') throw new ForbiddenException('Upgrade para Pro para usar esta funcionalidade.');
    return this.prisma.openFinanceConnection.findMany({ where: { userId: user.id } });
  }
}
""",

    "src/open-finance/open-finance.controller.ts": """import { Controller, Get } from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('open-finance')
export class OpenFinanceController {
  constructor(private readonly openFinanceService: OpenFinanceService) {}

  @Get()
  getConnections(@CurrentUser() user: any) {
    return this.openFinanceService.getConnections(user);
  }
}
""",

    "src/open-finance/open-finance.module.ts": """import { Module } from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { OpenFinanceController } from './open-finance.controller';

@Module({
  controllers: [OpenFinanceController],
  providers: [OpenFinanceService]
})
export class OpenFinanceModule {}
""",

    "src/ai/interfaces/ai-provider.interface.ts": """export interface AiProvider {
  extractTransaction(text: string, userId: string): Promise<{
    type: 'expense' | 'income' | 'transfer';
    category: string;
    amount: number;
    description: string;
    date: string; // ISO
    confidence: number;
  } | null>;
}
""",

    "src/ai/providers/gemini.provider.ts": """import { Injectable } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider implements AiProvider {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');
  }
  
  async extractTransaction(text: string, userId: string) {
      // Mock implementation for compilation
      return {
          type: 'expense' as const,
          category: 'Alimentação',
          amount: 10,
          description: text,
          date: new Date().toISOString(),
          confidence: 0.9,
      }
  }
}
""",

    "src/ai/ai.service.ts": """import { Injectable } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AiService {
  constructor(private geminiProvider: GeminiProvider) {}
  
  async processText(text: string, userId: string) {
    return this.geminiProvider.extractTransaction(text, userId);
  }
}
""",

    "src/ai/ai.module.ts": """import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
  providers: [AiService, GeminiProvider],
  exports: [AiService]
})
export class AiModule {}
""",

    "prisma/seed.ts": """import { PrismaClient, TransactionType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Test@1234', { memoryCost: 65536, timeCost: 3, parallelism: 4 });
  const user = await prisma.user.create({
    data: {
      email: 'teste@economizeja.com',
      name: 'Teste',
      passwordHash,
      plan: 'pro'
    }
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Alimentação', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Moradia', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Transporte', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Educação', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Lazer', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Saúde', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Vestuário', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Pets', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Outros', type: TransactionType.expense, userId: user.id } }),
    prisma.category.create({ data: { name: 'Salário', type: TransactionType.income, userId: user.id } }),
    prisma.category.create({ data: { name: 'Investimentos', type: TransactionType.income, userId: user.id } }),
    prisma.category.create({ data: { name: 'Vendas', type: TransactionType.income, userId: user.id } }),
  ]);

  const expenseCategory = categories.find(c => c.type === 'expense');
  const incomeCategory = categories.find(c => c.type === 'income');

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: i % 3 === 0 ? incomeCategory.id : expenseCategory.id,
        type: i % 3 === 0 ? TransactionType.income : TransactionType.expense,
        amount: Math.random() * 1000 + 10,
        description: 'Transação ' + i,
        date
      }
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
