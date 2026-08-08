import 'dotenv/config';

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  mode: (process.env.TELEGRAM_MODE || 'polling') as 'polling' | 'webhook',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  internalApiUrl: process.env.INTERNAL_API_URL || 'http://localhost:3001/api/v1',
  internalApiSecret: process.env.INTERNAL_API_SECRET || '',
};
