export interface ParsedTransaction {
  type: 'expense' | 'income';
  description: string;
  amount: number;
  date: string;
}

const EXPENSE_KEYWORDS = ['gasto', 'despesa', 'saida', 'saída', 'paguei', 'comprei'];
const INCOME_KEYWORDS = ['renda', 'receita', 'entrada', 'recebi', 'ganhei'];

export function parseTransaction(text: string): ParsedTransaction | null {
  const normalized = text.toLowerCase().trim();
  
  // Pattern: KEYWORD DESCRIPTION AMOUNT
  const pattern = /^(gasto|despesa|saida|saída|paguei|comprei|renda|receita|entrada|recebi|ganhei)\s+(.+?)\s+([\d.,]+)$/i;
  const match = normalized.match(pattern);
  
  if (!match) return null;
  
  const [, keyword, description, amountStr] = match;
  
  // Normalize amount: 55,90 -> 55.90 or 1.234,56 -> 1234.56
  const amount = parseFloat(amountStr.replace(/\.(\d{3})/g, '$1').replace(',', '.'));
  
  if (isNaN(amount) || amount <= 0) return null;
  
  const type = INCOME_KEYWORDS.includes(keyword.toLowerCase()) ? 'income' : 'expense';
  const today = new Date().toISOString().split('T')[0];
  
  return {
    type,
    description: description.trim(),
    amount,
    date: today,
  };
}
