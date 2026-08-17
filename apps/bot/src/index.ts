import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config';
import { api } from './api-client';
import { parseTransaction, ParsedTransaction } from './parsers/free-message.parser';

const bot = new Telegraf(config.botToken);

// Map para transações pendentes de confirmação
const pendingTransactions = new Map<number, {
  transaction: ParsedTransaction;
  timeout: ReturnType<typeof setTimeout>;
}>();

// Map para solicitações de zerar pendentes de confirmação
const pendingResets = new Map<number, {
  timeout: ReturnType<typeof setTimeout>;
}>();

// Helper de formatação de moeda BRL
function formatBRL(amount: any): string {
  const num = Number(amount || 0);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

async function handleLinking(ctx: Context, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code || !/^[A-Z0-9]{6,16}$/.test(code)) {
    return ctx.reply('❌ Código inválido. Gere um novo código no app.');
  }

  try {
    await api.linkAccount(code, ctx.chat!.id, ctx.from?.username);
    return ctx.reply([
      '✅ *Conta vinculada com sucesso!*',
      '',
      'Agora você pode lançar transações por aqui:',
      '• `gasto uber 55`',
      '• `renda salario 3000`',
      '• `despesa mercado 120,50`',
      '',
      '💡 *Dica:* Digite `/` para ver todas as opções (ex: `/resumo`, `/limite`, `/zerar`).',
    ].join('\n'), { parse_mode: 'Markdown' });
  } catch (error: any) {
    console.error('[Bot Link Error]:', error?.response?.status, error?.response?.data || error?.message);
    let msg = error?.response?.data?.message;
    if (!msg) {
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network') || error?.message?.includes('connect')) {
        msg = 'Falha de comunicação entre o Bot e a API. Verifique a URL da API.';
      } else {
        msg = error?.message || 'Código inválido ou expirado. Gere um novo código no app.';
      }
    }
    const displayMsg = Array.isArray(msg) ? msg.join(', ') : msg;
    return ctx.reply(`❌ ${displayMsg}`);
  }
}

// Comando /start
bot.start(async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const code = args[0]?.trim();
  if (code) {
    return handleLinking(ctx, code);
  }

  ctx.reply([
    '👋 Olá! Sou o bot do *Economize Já*!',
    '',
    'Para começar, vincule sua conta:',
    '1. Abra o app Economize Já',
    '2. Vá em *Perfil → Vincular Telegram*',
    '3. Gere um código de vínculo',
    '4. Envie o código aqui diretamente ou use: `/vincular SEU_CODIGO`',
    '',
    'Após vincular, lance transações assim:',
    '• `gasto uber 55`',
    '• `renda salario 3000`',
    '',
    '💡 *Dica:* Digite `/` a qualquer momento para ver o menu de opções!',
  ].join('\n'), { parse_mode: 'Markdown' });
});

// Comando /vincular CODIGO
bot.command('vincular', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const code = args[0]?.trim();
  if (!code) {
    return ctx.reply('❌ Por favor, informe o código: `/vincular SEU_CODIGO`', { parse_mode: 'Markdown' });
  }
  return handleLinking(ctx, code);
});

// Comando /resumo — Review de gastos x receitas do mês
bot.command('resumo', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
    const summary = await api.getSummaryByChatId(chatId);
    if (!summary) {
      return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
    }

    const {
      totalIncome,
      totalExpense,
      totalCreditExpense = 0,
      totalDebitExpense = 0,
      netMonth,
      currentBalance,
      status,
      creditCard
    } = summary;

    let statusMsg = '';
    if (status === 'surplus') {
      statusMsg = `🟢 *No Azul:* Suas receitas no débito superaram as saídas em *${formatBRL(netMonth)}* este mês!`;
    } else if (status === 'deficit') {
      statusMsg = `🔴 *No Vermelho:* Suas despesas no débito superaram a receita em *${formatBRL(Math.abs(netMonth))}* este mês.`;
    } else {
      statusMsg = `🟡 *Equilibrado:* Entradas e saídas no débito se equivalem este mês.`;
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const cardInfo = creditCard && creditCard.limit > 0
      ? `\n💳 *Fatura Cartão de Crédito:* ${formatBRL(creditCard.spent)} de ${formatBRL(creditCard.limit)} (${creditCard.percentage}% utilizado)`
      : totalCreditExpense > 0
        ? `\n💳 *Gastos no Cartão de Crédito:* ${formatBRL(totalCreditExpense)}`
        : '';

    return ctx.reply([
      `📊 *Resumo Financeiro — ${formattedMonth}*`,
      '',
      `💰 *Entradas (Receitas):* ${formatBRL(totalIncome)}`,
      `💸 *Saídas Totais:* ${formatBRL(totalExpense)}`,
      `   • 💳 *Cartão de Crédito:* ${formatBRL(totalCreditExpense)}`,
      `   • 💵 *Débito / Pix:* ${formatBRL(totalDebitExpense)}`,
      `───────────────`,
      `⚖️ *Balanço no Débito (Mês):* ${netMonth >= 0 ? '+' : ''}${formatBRL(netMonth)}`,
      `💵 *Saldo Atual em Conta:* ${formatBRL(currentBalance)}`,
      cardInfo,
      '',
      statusMsg,
    ].join('\n'), { parse_mode: 'Markdown' });
  } catch (error: any) {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
  }
});

// Comando /limite ou /meta — Limite de Cartão de Crédito
const handleLimite = async (ctx: Context) => {
  const chatId = ctx.chat!.id;
  try {
    const summary = await api.getSummaryByChatId(chatId);
    if (!summary || !summary.creditCard) {
      return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
    }

    const { limit, spent, remaining, percentage } = summary.creditCard;
    if (!limit || limit === 0) {
      return ctx.reply('ℹ️ Você ainda não definiu um limite de cartão. Defina seu limite nas *Configurações* do aplicativo web.', { parse_mode: 'Markdown' });
    }

    let badge = '🟢 *Dentro do Limite*';
    if (spent > limit) badge = '🚨 *LIMITE EXCEDIDO!*';
    else if (percentage >= 90) badge = '🔴 *Alerta de Limite Quase Esgotado!*';
    else if (percentage >= 70) badge = '🟡 *Atenção ao Consumo!*';

    return ctx.reply([
      '💳 *Meta / Limite de Cartão de Crédito*',
      '',
      `🎯 *Limite Definido:* ${formatBRL(limit)}`,
      `💸 *Utilizado no Mês:* ${formatBRL(spent)} (${percentage}%)`,
      `💵 *Disponível para Gastar:* ${formatBRL(remaining)}`,
      '',
      badge,
    ].join('\n'), { parse_mode: 'Markdown' });
  } catch {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
  }
};

bot.command('limite', handleLimite);
bot.command('meta', handleLimite);

// Comando /saldo — Ver saldo atual
bot.command('saldo', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
    const summary = await api.getSummaryByChatId(chatId);
    if (!summary) {
      return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
    }

    return ctx.reply([
      `💵 *Seu Saldo Atual:* ${formatBRL(summary.currentBalance)}`,
      `📊 *Balanço deste mês:* ${summary.netMonth >= 0 ? '+' : ''}${formatBRL(summary.netMonth)}`,
    ].join('\n'), { parse_mode: 'Markdown' });
  } catch (error: any) {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
  }
});

// Comando /zerar — Limpar todas as transações
bot.command('zerar', async (ctx) => {
  const chatId = ctx.chat.id;
  try {
    const user = await api.getUserByChatId(chatId);
    if (!user) {
      return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
    }

    ctx.reply([
      '⚠️ *ATENÇÃO: DESEJA ZERAR SEUS DADOS?*',
      '',
      'Esta ação irá arquivar **todas as suas transações** e resetar seu saldo para R$ 0,00 para você começar do zero.',
      '',
      'Para confirmar, responda **sim** ou **não**.',
    ].join('\n'), { parse_mode: 'Markdown' });

    const timeout = setTimeout(() => {
      pendingResets.delete(chatId);
    }, 2 * 60 * 1000);

    pendingResets.set(chatId, { timeout });
  } catch {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.');
  }
});

// Handler de mensagens de texto
bot.on(message('text'), async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();

  // Se o texto for puramente um código alfanumérico de 6 a 16 caracteres (ex: 8F3A21)
  if (/^[A-Za-z0-9]{6,16}$/.test(text) && !text.includes(' ')) {
    return handleLinking(ctx, text);
  }

  // Verificar se há pendência de zerar dados
  const pendingReset = pendingResets.get(chatId);
  if (pendingReset) {
    const lower = text.toLowerCase();
    if (['sim', 's', 'yes', 'y'].includes(lower)) {
      clearTimeout(pendingReset.timeout);
      pendingResets.delete(chatId);
      try {
        const res = await api.resetTransactions(chatId);
        return ctx.reply(`🧹 *Histórico Zerado com Sucesso!* ${res.resetCount || 0} lançamentos foram arquivados. Seu saldo agora é *R$ 0,00*.`, { parse_mode: 'Markdown' });
      } catch {
        return ctx.reply('⚠️ Erro ao zerar histórico. Tente novamente.');
      }
    }
    if (['nao', 'não', 'n', 'no'].includes(lower)) {
      clearTimeout(pendingReset.timeout);
      pendingResets.delete(chatId);
      return ctx.reply('❌ Operação cancelada. Seus dados foram mantidos.');
    }
  }

  // Verificar se é resposta de confirmação de transação
  const pending = pendingTransactions.get(chatId);
  if (pending) {
    const lower = text.toLowerCase();
    if (['sim', 's', 'yes', 'y'].includes(lower)) {
      clearTimeout(pending.timeout);
      pendingTransactions.delete(chatId);
      try {
        const isInstallment = pending.transaction.installmentsCount && pending.transaction.installmentsCount > 1;
        const totalAmountPayload = isInstallment
          ? Number((pending.transaction.amount * pending.transaction.installmentsCount).toFixed(2))
          : pending.transaction.amount;

        const result = await api.createTransaction(chatId, {
          ...pending.transaction,
          amount: totalAmountPayload,
          source: 'bot_free',
        });
        
        let responseMsg = '✅ *Transação registrada com sucesso!*';
        if (result && result.creditCardAlert) {
          responseMsg += `\n\n${result.creditCardAlert}`;
        }

        ctx.reply(responseMsg, { parse_mode: 'Markdown' });
      } catch (err: any) {
        const errMsg = err?.response?.data?.message || 'Erro ao registrar transação. Tente novamente.';
        ctx.reply(`⚠️ ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
      }
      return;
    }
    if (['nao', 'não', 'n', 'no'].includes(lower)) {
      clearTimeout(pending.timeout);
      pendingTransactions.delete(chatId);
      ctx.reply('❌ Transação cancelada.');
      return;
    }
  }

  // Verificar se conta está vinculada
  let user: any;
  try {
    user = await api.getUserByChatId(chatId);
  } catch {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
  }

  if (!user) {
    return ctx.reply('⚠️ Sua conta não está vinculada. Use `/vincular CODIGO` para conectar.', { parse_mode: 'Markdown' });
  }

  // Tentar parsear a mensagem
  const parsed = parseTransaction(text);

  if (!parsed) {
    return ctx.reply([
      '❓ Não entendi o formato.',
      '',
      'Use assim:',
      '• `gasto uber 55`',
      '• `renda salario 3000`',
      '• `despesa mercado 120,50`',
      '',
      'Ou digite `/` para ver o menu de opções.',
    ].join('\n'), { parse_mode: 'Markdown' });
  }

  // Confirmação antes de gravar
  const typeLabel = parsed.type === 'income' ? '➕ Receita' : '➖ Despesa';
  const isInstallment = parsed.installmentsCount && parsed.installmentsCount > 1;
  const paymentLabel = parsed.type === 'income'
    ? ''
    : isInstallment
      ? `💳 Cartão de Crédito (Parcelado em ${parsed.installmentsCount}x)`
      : parsed.paymentMethod === 'credit'
        ? '💳 Cartão de Crédito'
        : '💵 Débito / Pix';

  const msg = [
    '📝 *Entendi:*',
    `• Tipo: ${typeLabel}`,
    ...(parsed.type === 'expense' ? [`• Pagamento: ${paymentLabel}`] : []),
    `• Descrição: ${parsed.description}`,
    `• Valor${isInstallment ? ' por parcela' : ''}: ${formatBRL(parsed.amount)}`,
    ...(isInstallment ? [`• Total Geral: ${formatBRL(parsed.amount * parsed.installmentsCount)} (lançado automaticamente pelos próximos ${parsed.installmentsCount} meses)`] : []),
    `• Data: ${formatDate(parsed.date)}`,
    '',
    'Confirmar? Responda *sim* ou *não*',
  ].join('\n');

  ctx.reply(msg, { parse_mode: 'Markdown' });

  // Armazenar com timeout de 2 minutos
  const timeout = setTimeout(() => {
    pendingTransactions.delete(chatId);
  }, 2 * 60 * 1000);

  pendingTransactions.set(chatId, { transaction: parsed, timeout });
});

// Inicializar bot
async function bootstrap() {
  try {
    // Configurar menu nativo de comandos do Telegram (ao digitar /)
    await bot.telegram.setMyCommands([
      { command: 'resumo', description: '📊 Resumo de gastos vs receitas do mês' },
      { command: 'limite', description: '💳 Meta e consumo do cartão de crédito' },
      { command: 'saldo', description: '💵 Ver saldo total acumulado' },
      { command: 'zerar', description: '🧹 Zerar histórico (começar do zero)' },
      { command: 'vincular', description: '🔗 Vincular conta do aplicativo' },
      { command: 'start', description: '👋 Instruções de uso' },
    ]);
  } catch (err) {
    console.error('Aviso ao registrar comandos do Telegram:', err);
  }

  if (config.mode === 'webhook') {
    await bot.telegram.setWebhook(config.webhookUrl, {
      secret_token: config.webhookSecret,
    });
    console.log('🤖 Bot iniciado em modo webhook');
  } else {
    bot.launch();
    console.log('🤖 Bot iniciado em modo polling');
  }

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

bootstrap();
