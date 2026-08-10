export interface ParsedTransaction {
  type: 'expense' | 'income';
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'credit' | 'debit';
  installmentsCount: number;
}

const INCOME_KEYWORDS = ['renda', 'receita', 'entrada', 'recebi', 'ganhei'];
const CREDIT_KEYWORDS = ['cartao', 'cartão', 'credito', 'crédito', 'cc', 'fatura'];

export function parseTransaction(text: string): ParsedTransaction | null {
  const normalized = text.toLowerCase().trim();

  // Pattern: KEYWORD DESCRIPTION AMOUNT (e.g. "gasto camiseta 50 parcelado 5x", "cartao notebook 500 10x")
  const pattern = /^(gasto|despesa|saida|saída|paguei|comprei|renda|receita|entrada|recebi|ganhei|cartao|cartão|credito|crédito|pix|debito|débito)\s+(.+?)\s+([\d.,]+)(?:\s+(.*))?$/i;
  const match = normalized.match(pattern);

  if (!match) return null;

  const [, firstKeyword, rawDescriptionPart1, amountStr, extraPart2 = ''] = match;

  // Normalize amount: 55,90 -> 55.90 or 1.234,56 -> 1234.56
  const amount = parseFloat(amountStr.replace(/\.(\d{3})/g, '$1').replace(',', '.'));
  if (isNaN(amount) || amount <= 0) return null;

  const fullContext = `${rawDescriptionPart1} ${extraPart2}`.trim();

  const isIncome = INCOME_KEYWORDS.includes(firstKeyword.toLowerCase());
  const type: 'expense' | 'income' = isIncome ? 'income' : 'expense';

  // Check for installments: e.g., "5x", "10x", "parcelado em 5x", "em 5x", "5 parcelas"
  let installmentsCount = 1;
  const installmentRegex = /\b(?:parcelado\s+(?:em\s+)?)?(\d{1,2})\s*(?:x|parcelas?)\b/i;
  const installmentMatch = fullContext.match(installmentRegex);

  if (installmentMatch) {
    const num = parseInt(installmentMatch[1], 10);
    if (!isNaN(num) && num > 1 && num <= 48) {
      installmentsCount = num;
    }
  }

  // Determine Payment Method (installments always force credit card)
  let paymentMethod: 'credit' | 'debit' = installmentsCount > 1 ? 'credit' : 'debit';

  if (!isIncome && installmentsCount === 1) {
    const hasCreditInKeyword = CREDIT_KEYWORDS.includes(firstKeyword.toLowerCase());
    const hasCreditInDesc = CREDIT_KEYWORDS.some((kw) => normalized.includes(kw));

    if (hasCreditInKeyword || hasCreditInDesc) {
      paymentMethod = 'credit';
    }
  }

  // Clean description of payment method and installment tags
  let cleanDesc = fullContext;
  const cleanRegex = /\b(no|em|via|pelo|na)?\s*(cartao|cartão|credito|crédito|debito|débito|pix|dinheiro)\b/gi;
  cleanDesc = cleanDesc.replace(cleanRegex, '');
  cleanDesc = cleanDesc.replace(installmentRegex, '');
  cleanDesc = cleanDesc.replace(/\s+/g, ' ').trim();

  if (!cleanDesc) {
    cleanDesc = rawDescriptionPart1.trim();
  }

  const today = new Date().toISOString().split('T')[0];

  return {
    type,
    description: cleanDesc,
    amount,
    date: today,
    paymentMethod,
    installmentsCount,
  };
}
