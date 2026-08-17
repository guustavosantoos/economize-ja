import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.MAIL_FROM_EMAIL || 'onboarding.economizeja@gmail.com';
const SENDER_NAME = process.env.MAIL_FROM_NAME || 'Economize Já';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://economize-ja-production.up.railway.app';

async function sendPromoEmail(toEmail: string, userName?: string, customCheckoutUrl?: string) {
  if (!BREVO_API_KEY) {
    console.error('❌ Chave BREVO_API_KEY não configurada no .env!');
    process.exit(1);
  }

  const name = userName ? userName.split(' ')[0] : toEmail.split('@')[0];
  const targetUrl = customCheckoutUrl || `${APP_URL}/pro`;

  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; padding: 40px 16px; color: #f8fafc;">
  <div style="max-width: 560px; margin: 0 auto; background: #111827; border-radius: 24px; border: 1px solid #1e293b; padding: 36px 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    
    <!-- Logo & Badge -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: 800; color: #34d399; letter-spacing: 0.5px; margin-bottom: 12px;">
        🎁 OFERTA EXCLUSIVA DE BOAS-VINDAS
      </div>
      <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 8px 0 0 0; letter-spacing: -0.5px;">
        Economize <span style="color: #10b981;">Já</span>
      </h1>
    </div>

    <!-- Main Heading -->
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 28px;">
      <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">
        Parabéns! Você ganhou 7 Dias Grátis do Plano PRO 🔥
      </h2>
      <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
        Experimente o controle financeiro definitivo com Inteligência Artificial no Telegram, gestão de cartões de crédito e alertas automáticos.
      </p>
    </div>

    <!-- Body Content -->
    <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin-bottom: 20px;">
      Olá, <strong>${name}</strong>!
    </p>
    <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
      Para celebrar o seu cadastro no Economize Já, liberamos um passe livre de <strong>7 dias totalmente grátis</strong> para você testar todas as funcionalidades premium do <strong>Plano PRO</strong>.
    </p>

    <!-- Key Features List -->
    <div style="background: #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
      <h3 style="color: #34d399; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0;">
        ✨ O que você libera com o Plano PRO:
      </h3>
      
      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
        <span style="font-size: 18px; margin-right: 10px;">🤖</span>
        <div>
          <strong style="color: #ffffff; font-size: 14px;">Bot no Telegram com IA:</strong>
          <span style="color: #94a3b8; font-size: 13px; display: block;">Lance gastos por áudio ou mensagens de texto livre (ex: "gasto mercado 120 parcelado 3x").</span>
        </div>
      </div>

      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
        <span style="font-size: 18px; margin-right: 10px;">💳</span>
        <div>
          <strong style="color: #ffffff; font-size: 14px;">Gestão de Cartão de Crédito:</strong>
          <span style="color: #94a3b8; font-size: 13px; display: block;">Controle de limite, projeção de fatura e parcelamentos de 1x a 24x sem complicação.</span>
        </div>
      </div>

      <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
        <span style="font-size: 18px; margin-right: 10px;">⏰</span>
        <div>
          <strong style="color: #ffffff; font-size: 14px;">Lembretes de Contas Recorrentes:</strong>
          <span style="color: #94a3b8; font-size: 13px; display: block;">Avisos prévios de vencimento para nunca mais pagar multas ou juros por esquecimento.</span>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start;">
        <span style="font-size: 18px; margin-right: 10px;">📊</span>
        <div>
          <strong style="color: #ffffff; font-size: 14px;">Relatórios Avançados & Exportação:</strong>
          <span style="color: #94a3b8; font-size: 13px; display: block;">Gráficos detalhados por categoria e exportação ilimitada em Excel ou JSON.</span>
        </div>
      </div>
    </div>

    <!-- Guarantee Box -->
    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 28px; text-align: center;">
      <p style="color: #60a5fa; font-size: 13px; font-weight: 600; margin: 0;">
        🛡️ <strong>Garantia Incondicional:</strong> R$ 0,00 cobrados hoje. Você tem 7 dias inteiros para usar. Se cancelar antes dos 7 dias, nada será cobrado no seu cartão!
      </p>
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${targetUrl}" target="_blank" style="display: inline-block; background: #10b981; color: #090d16; font-size: 16px; font-weight: 900; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);">
        🚀 Ativar Meus 7 Dias Grátis Agora
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #1e293b; margin: 28px 0;" />
    
    <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center; line-height: 1.5;">
      Economize Já — Seu controle financeiro inteligente.<br/>
      Dúvidas? Responda a este e-mail que nossa equipe te ajuda!
    </p>
  </div>
</div>
  `;

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject: '🎁 Você ganhou 7 Dias Grátis do Plano PRO no Economize Já!',
        htmlContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY.trim(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    console.log(`✅ [Brevo Promo Email Sent] E-mail promocional enviado para: ${toEmail} | MessageId: ${response.data?.messageId}`);
  } catch (err: any) {
    console.error('❌ Error sending email via Brevo:', err?.response?.data || err.message);
  }
}

const targetEmail = process.argv[2] || 'guuh.santos153@gmail.com';
console.log(`🚀 Disparando e-mail de promoção de 7 dias grátis para: ${targetEmail}...`);
sendPromoEmail(targetEmail);
