export interface AiProvider {
  extractTransaction(text: string, userId: string): Promise<{
    type: 'expense' | 'income' | 'transfer';
    category: string;
    amount: number;
    description: string;
    date: string; // ISO
    confidence: number;
  } | null>;
}
