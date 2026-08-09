FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/bot/package*.json ./

RUN npm install

COPY apps/bot .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
