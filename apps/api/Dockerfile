FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências nativas para compilar o argon2 no Alpine Linux
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN npm ci

COPY apps/api ./apps/api
COPY packages ./packages

RUN ./apps/api/node_modules/.bin/prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package*.json ./apps/api/

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
