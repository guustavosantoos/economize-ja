import axios from 'axios';
import { config } from './config';

console.log(`[Bot API Client] Conectando na API em: ${config.internalApiUrl}`);

const client = axios.create({
  baseURL: config.internalApiUrl,
  headers: { 'x-internal-secret': config.internalApiSecret },
  timeout: 10000,
});

export const api = {
  // Verificar se chatId já tem conta vinculada
  getUserByChatId: async (chatId: number) => {
    const res = await client.get(`/telegram/internal/user-by-chat/${chatId}`);
    return res.data?.data ?? res.data;
  },

  // Obter resumo financeiro do mês
  getSummaryByChatId: async (chatId: number) => {
    const res = await client.get(`/telegram/internal/summary/${chatId}`);
    return res.data?.data ?? res.data;
  },

  // Vincular código ao chatId
  linkAccount: async (code: string, chatId: number, username?: string) => {
    const res = await client.post('/telegram/internal/link', {
      code,
      chatId,
      telegramUsername: username,
    });
    return res.data?.data ?? res.data;
  },

  // Zerar transações
  resetTransactions: async (chatId: number) => {
    const res = await client.post('/telegram/internal/reset', { chatId });
    return res.data?.data ?? res.data;
  },

  // Criar transação
  createTransaction: async (chatId: number, transaction: {
    type: string;
    description: string;
    amount: number;
    date: string;
    source: string;
  }) => {
    const res = await client.post('/telegram/internal/create-transaction', {
      chatId,
      ...transaction,
    });
    return res.data?.data ?? res.data;
  },
};
