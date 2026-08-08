# 💰 Economize Já

App de finanças pessoais mobile-first (PWA) com bot Telegram integrado. Modelo freemium (Free / Pro).

## 🏗️ Arquitetura

```
economize-ja/                    # Monorepo (npm workspaces)
├── apps/
│   ├── api/                     # NestJS REST API (porta 3001)
│   ├── web/                     # Next.js 14 PWA (porta 3000)
│   └── bot/                     # Telegraf Bot Telegram
├── packages/
│   └── shared-types/            # DTOs TypeScript compartilhados
├── docker-compose.yml           # PostgreSQL 16 + Redis 7
└── .env.example
```

## ⚡ Setup Local (5 minutos)

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- npm 10+

### 1. Clone e instale dependências

```bash
git clone <repo-url> economize-ja
cd economize-ja
npm install
```

### 2. Configure as variáveis de ambiente

```bash
# Raiz do projeto
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env   # se existir
# OU edite o .env na raiz e copie para apps/api/.env

# Bot
cp apps/bot/.env apps/bot/.env.local     # ajuste as variáveis
```

Variáveis **obrigatórias** para começar:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret para JWT access token |
| `JWT_REFRESH_SECRET` | Secret para JWT refresh token |
| `RESEND_API_KEY` | API key do [Resend](https://resend.com) para e-mails |
| `TELEGRAM_BOT_TOKEN` | Token do bot (obtido no @BotFather) |

### 3. Suba os serviços de infraestrutura

```bash
docker compose up -d
# PostgreSQL disponível em localhost:5432
# Redis disponível em localhost:6379
```

### 4. Configure o banco de dados

```bash
# Gera o Prisma Client
cd apps/api
npx prisma generate

# Roda as migrations
npx prisma migrate dev --name init

# Popula categorias padrão + usuário de teste
npx prisma db seed
```

**Usuário de teste criado pelo seed:**
- Email: `teste@economizeja.com`
- Senha: `Test@1234`

### 5. Inicie os serviços

**Opção A — Tudo junto:**
```bash
# Na raiz do monorepo
npm run dev
```

**Opção B — Separadamente (recomendado para desenvolvimento):**
```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Frontend
npm run dev:web

# Terminal 3 — Bot (opcional, precisa de TELEGRAM_BOT_TOKEN válido)
npm run dev:bot
```

Serviços disponíveis:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:3001/api/v1
- 📖 **Prisma Studio**: `npm run db:studio`

---

## 📱 Funcionalidades

### Plano Free
- ✅ Cadastro/login com verificação de e-mail
- ✅ CRUD de transações (despesa, renda, transferência)
- ✅ Dashboard: saldo mensal, gráficos, evolução
- ✅ Bot Telegram: vincular conta + lançar por padrão fixo
- ✅ Exportar/excluir dados (LGPD)

### Plano Pro (backend preparado, UI "em breve")
- 🔒 Assistente de IA no Telegram (frases livres via Gemini)
- 🔒 Lembretes de contas a pagar
- 🔒 Open Finance (abstração para Pluggy/Belvo/Quanto)

---

## 🤖 Bot Telegram

### Configurar o bot

1. Fale com [@BotFather](https://t.me/BotFather) e crie um bot
2. Copie o token e coloque em `TELEGRAM_BOT_TOKEN`
3. Para desenvolvimento, use modo `polling`:
   ```env
   TELEGRAM_MODE=polling
   ```
4. Para produção, use webhook:
   ```env
   TELEGRAM_MODE=webhook
   TELEGRAM_WEBHOOK_URL=https://sua-api.com/api/v1/telegram/webhook
   TELEGRAM_WEBHOOK_SECRET=seu-secret
   ```

### Vincular conta ao bot

1. Acesse o app → Configurações → Vincular Telegram
2. Clique em "Gerar Código"
3. Abra o bot no Telegram e envie: `/vincular SEU_CODIGO`
4. Pronto! Agora lance transações direto pelo Telegram:
   - `gasto uber 55`
   - `renda salario 3000`
   - `despesa mercado 120,50`

---

## 🔌 API — Endpoints Principais

Base URL: `http://localhost:3001/api/v1`

### Auth
```
POST   /auth/register          Cadastro
POST   /auth/login             Login (retorna access token + cookie refresh)
POST   /auth/refresh           Refresh token rotation
POST   /auth/logout            Logout
GET    /auth/verify-email      Verificação de e-mail (?token=)
```

### Usuário (LGPD)
```
GET    /users/me               Perfil
PATCH  /users/me               Atualizar perfil
GET    /users/me/export        Exportar todos os dados (JSON)
DELETE /users/me               Excluir conta (soft delete)
```

### Transações
```
GET    /transactions           Listar (filtros: month, type, categoryId)
POST   /transactions           Criar
GET    /transactions/:id       Detalhe
PATCH  /transactions/:id       Atualizar
DELETE /transactions/:id       Excluir (soft delete)
```

### Dashboard
```
GET    /dashboard/summary?month=YYYY-MM
GET    /dashboard/by-category?month=YYYY-MM
GET    /dashboard/monthly-evolution
```

### Telegram
```
POST   /telegram/link-code     Gerar código de vínculo (10min)
GET    /telegram/status        Status do vínculo
DELETE /telegram/unlink        Desvincular
```

---

## 🗄️ Banco de Dados

Schema completo em `apps/api/prisma/schema.prisma`.

```
users                    Usuários (soft delete LGPD)
email_verifications      Tokens de verificação de e-mail
refresh_tokens           Refresh tokens com rotação por família
categories               Categorias (padrão + personalizadas)
transactions             Transações (soft delete)
telegram_links           Vínculos Telegram (sem telefone, apenas chatId)
audit_logs               Logs de auditoria (login, export, delete)
bills                    Contas a pagar [Pro]
bill_reminders           Lembretes agendados [Pro]
open_finance_connections Conexões Open Finance [Pro abstração]
```

### Migrations

```bash
# Nova migration
cd apps/api
npx prisma migrate dev --name nome_da_migration

# Aplicar em produção
npx prisma migrate deploy

# Reset (⚠️ apaga dados)
npx prisma migrate reset
```

---

## 🚀 Deploy

### Frontend → Vercel

```bash
cd apps/web
npx vercel --prod
```

Variáveis de ambiente na Vercel:
```
NEXT_PUBLIC_API_URL=https://sua-api.railway.app/api/v1
```

### API + Bot → Railway

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione serviços: PostgreSQL, Redis
3. Deploy da API:
   ```bash
   cd apps/api
   railway up
   ```
4. Deploy do Bot:
   ```bash
   cd apps/bot
   railway up
   ```

Configure todas as variáveis do `.env.example` no painel do Railway.

---

## 🔐 Segurança

| Medida | Implementação |
|---|---|
| Hash de senha | Argon2id (memoryCost=65536, timeCost=3) |
| JWT | Access 15min + Refresh 30 dias (httpOnly cookie) |
| Refresh rotation | Token family — detecta roubo de token |
| Rate limit | 5 tentativas/15min no `/auth/login` (ThrottlerGuard + Redis) |
| Criptografia em repouso | `description` das transações criptografado (DB_ENCRYPTION_KEY) |
| Audit logs | login, export, delete — rastreáveis |
| LGPD | Export JSON + soft delete + anonimização após 30 dias |
| CORS | Apenas WEB_URL aceita credenciais |
| Helmet | Headers HTTP de segurança |

---

## 🧪 Testes

```bash
# Unitários (API)
cd apps/api
npm run test

# E2E (API)
npm run test:e2e

# Type check (todos os workspaces)
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
cd apps/bot && npx tsc --noEmit
```

---

## 📋 Variáveis de Ambiente

Veja o arquivo [.env.example](.env.example) na raiz do projeto para a lista completa e documentada de todas as variáveis necessárias.

---

## 🛠️ Tecnologias

| Camada | Stack |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS, Recharts, Zustand |
| Backend | NestJS, Prisma ORM, PostgreSQL, Redis |
| Auth | JWT, Argon2id, Passport.js |
| Bot | Telegraf |
| IA (Pro) | Google Gemini via @google/generative-ai |
| E-mail | Resend |
| Jobs | BullMQ |
| Deploy | Vercel (web) + Railway (api + bot) |

---

## 📁 Estrutura de Módulos (API)

```
apps/api/src/
├── main.ts                  # Bootstrap: CORS, Helmet, ValidationPipe
├── app.module.ts            # Root module
├── prisma/                  # PrismaService (global)
├── common/                  # Guards, Decorators, Filters, Interceptors
├── audit/                   # AuditService — logs de segurança
├── mail/                    # MailService via Resend
├── auth/                    # Register, Login, Refresh, Logout, Verify-Email
├── users/                   # Perfil, LGPD export/delete
├── categories/              # CRUD categorias
├── transactions/            # CRUD transações + soft delete
├── dashboard/               # Aggregações para o dashboard
├── telegram/                # Link code, webhook, internal endpoints
├── bills/                   # [Pro] Contas a pagar
├── open-finance/            # [Pro] Abstração Open Finance
└── ai/                      # [Pro] AiProvider interface + GeminiProvider
```

---

*Economize Já — Desenvolvido com ❤️ para o controle financeiro pessoal*
