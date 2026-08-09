import 'dotenv/config';

let apiUrl = process.env.INTERNAL_API_URL || 'https://api-production-4879.up.railway.app/api/v1';
if (apiUrl.includes('localhost') && (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT)) {
  apiUrl = 'https://api-production-4879.up.railway.app/api/v1';
}

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  mode: (process.env.TELEGRAM_MODE || 'polling') as 'polling' | 'webhook',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  internalApiUrl: apiUrl,
  internalApiSecret: process.env.INTERNAL_API_SECRET || '',
};
