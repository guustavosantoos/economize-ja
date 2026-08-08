FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/bot/package*.json ./apps/bot/

RUN npm ci

COPY apps/bot ./apps/bot

CMD ["npm", "run", "dev:bot"]
