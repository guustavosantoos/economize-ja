import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(compression());
  app.use(cookieParser());

  // Helmet com CSP seguro
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // Restrição explícita de CORS para origens permitidas
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pela política CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ─── Swagger ───────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Economize Já — API')
    .setDescription(
      `API REST do app de finanças pessoais Economize Já.\n\n` +
      `**Como autenticar:**\n` +
      `1. Faça POST em /auth/login com email + senha\n` +
      `2. Copie o \`accessToken\` da resposta\n` +
      `3. Clique em **Authorize** e cole o token no campo Bearer\n\n` +
      `**Usuário de teste:** teste@economizeja.com / Test@1234`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Users', 'Perfil do usuário e LGPD')
    .addTag('Categories', 'Categorias de transações')
    .addTag('Transactions', 'CRUD de transações')
    .addTag('Dashboard', 'Dados agregados para o dashboard')
    .addTag('Telegram', 'Integração com o bot Telegram')
    .addTag('Bills', 'Contas a pagar [Pro]')
    .addTag('Open Finance', 'Conexões Open Finance [Pro]')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Economize Já — API Docs',
    customfavIcon: '',
    customCss: `
      .swagger-ui .topbar { background: #003535; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #003535; }
      .swagger-ui .btn.execute { background: #003535; border-color: #003535; }
    `,
  });

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`\n🚀 API rodando em     http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger disponível em http://localhost:${port}/docs\n`);
}
bootstrap();
