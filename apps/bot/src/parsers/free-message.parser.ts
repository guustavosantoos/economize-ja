export interface ParsedTransaction {
  type: 'expense' | 'income';
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'credit' | 'debit';
}

const INCOME_KEYWORDS = ['renda', 'receita', 'entrada', 'recebi', 'ganhei'];
const CREDIT_KEYWORDS = ['cartao', 'cartão', 'credito', 'crédito', 'cc', 'fatura'];
const DEBIT_KEYWORDS = ['debito', 'débito', 'pix', 'dinheiro', 'especie', 'espécie', 'conta'];

export function parseTransaction(text: string): ParsedTransaction | null {
  const normalized = text.toLowerCase().trim();

  // Keyword at start (e.g. "gasto uber 55", "cartao mercado 120", "pix padaria 15", "renda salario 3000")
  const pattern = /^(gasto|despesa|saida|saída|paguei|comprei|renda|receita|entrada|recebi|ganhei|cartao|cartão|credito|crédito|pix|debito|débito)\s+(.+?)\s+([\d.,]+)$/i;
  const match = normalized.match(pattern);

  if (!match) return null;

  const [, firstKeyword, rawDescription, amountStr] = match;

  // Normalize amount: 55,90 -> 55.90 or 1.234,56 -> 1234.56
  const amount = parseFloat(amountStr.replace(/\.(\d{3})/g, '$1').replace(',', '.'));
  if (isNaN(amount) || amount <= 0) return null;

  const isIncome = INCOME_KEYWORDS.includes(firstKeyword.toLowerCase());
  const type: 'expense' | 'income' = isIncome ? 'income' : 'expense';

  // Determine Payment Method
  let paymentMethod: 'credit' | 'debit' = 'debit';

  if (!isIncome) {
    const hasCreditInKeyword = CREDIT_KEYWORDS.includes(firstKeyword.toLowerCase());
    const hasCreditInDesc = CREDIT_KEYWORDS.some((kw) => normalized.includes(kw));

    if (hasCreditInKeyword || hasCreditInDesc) {
      paymentMethod = 'credit';
    }
  }

  // Clean description of payment method tags like "no cartao", "no debito", "cartao", "credito"
  let cleanDesc = rawDescription;
  const cleanRegex = /\b(no|em|via|pelo|na)?\s*(cartao|cartão|credito|crédito|debito|débito|pix|dinheiro)\b/gi;
  cleanDesc = cleanDesc.replace(cleanRegex, '').replace(/\s+/g, ' ').trim();

  if (!cleanDesc) {
    cleanDesc = rawDescription.trim();
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    type,
    description: cleanDesc,
    amount,
    date: today,
    paymentMethod,
  };
}
