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

  const name = userName ? userName.split(' ')[0] : '{{ contact.FIRSTNAME | default: "Economizador" }}';
  const targetUrl = customCheckoutUrl || `${APP_URL}/pro`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>7 Dias Grátis Plano PRO — Economize Já</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f8fafc;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #111827; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);">
          
          <!-- Header Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #10b981, #06b6d4);"></td>
          </tr>

          <!-- Inner Content -->
          <tr>
            <td style="padding: 36px 32px;">
              
              <!-- Brand Logo & Badge -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; tracking-tight: -0.5px;">
                      Economize <span style="color: #10b981;">Já</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 800; color: #34d399; letter-spacing: 0.5px; text-transform: uppercase;">
                      🎁 Presente Especial
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Main Hero Banner -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a2333; border: 1px solid #28354a; border-radius: 20px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px; text-align: left;">
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0 0 8px 0; line-height: 1.3;">
                      Você ganhou 7 Dias Grátis do nosso Plano PRO 🔥
                    </h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5; font-weight: 500;">
                      Experimente a inteligência artificial no Telegram, gestão de cartão de crédito e lembretes sem pagar nada hoje.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Greeting & Introduction -->
              <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin: 0 0 16px 0;">
                Fala, <strong>${name}</strong>!
              </p>
              <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
                Liberamos um <strong>passe livre VIP de 7 dias grátis</strong> para você testar na prática como o Economize Já PRO facilita o seu dia a dia e coloca suas finanças no piloto automático.
              </p>

              <!-- Feature Callout List -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 16px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #34d399; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0;">
                      ✨ O que fica disponível para você imediatamente:
                    </p>
                    
                    <!-- Item 1 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="32" valign="top" style="font-size: 18px; line-height: 1;">🤖</td>
                        <td style="font-size: 14px; color: #ffffff; line-height: 1.4;">
                          <strong>Bot de Inteligência Artificial no Telegram</strong><br/>
                          <span style="font-size: 13px; color: #94a3b8;">Registre seus gastos por mensagens de voz ou textos livres (ex: <i>"gasto mercado 150 em 3x"</i>).</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 2 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="32" valign="top" style="font-size: 18px; line-height: 1;">💳</td>
                        <td style="font-size: 14px; color: #ffffff; line-height: 1.4;">
                          <strong>Gestão de Cartão de Crédito & Parcelamentos</strong><br/>
                          <span style="font-size: 13px; color: #94a3b8;">Acompanhe limites, projeções de fatura e controle parcelas de 1x a 24x.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 3 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="32" valign="top" style="font-size: 18px; line-height: 1;">⏰</td>
                        <td style="font-size: 14px; color: #ffffff; line-height: 1.4;">
                          <strong>Lembretes de Contas a Pagar</strong><br/>
                          <span style="font-size: 13px; color: #94a3b8;">Receba avisos antes do vencimento para nunca mais pagar multas ou juros por esquecimento.</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 4 -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="32" valign="top" style="font-size: 18px; line-height: 1;">📊</td>
                        <td style="font-size: 14px; color: #ffffff; line-height: 1.4;">
                          <strong>Relatórios Avançados & Exportação Ilimitada</strong><br/>
                          <span style="font-size: 13px; color: #94a3b8;">Baixe seus dados financeiros completos em Excel ou JSON quando quiser.</span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Timeline of How the 7 Days Work -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; background-color: #131b29; border: 1px solid #1f2d42; border-radius: 16px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="color: #60a5fa; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
                      📅 Como funciona o teste sem risco:
                    </p>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="33%" style="font-size: 12px; color: #e2e8f0; border-right: 1px solid #1f2d42; padding-right: 8px;">
                          <strong style="color: #10b981; display: block; margin-bottom: 2px;">Hoje (Dia 1)</strong>
                          R$ 0,00 cobrados.<br/>Acesso PRO liberado.
                        </td>
                        <td width="33%" style="font-size: 12px; color: #e2e8f0; padding: 0 8px; border-right: 1px solid #1f2d42;">
                          <strong style="color: #60a5fa; display: block; margin-bottom: 2px;">Até o Dia 7</strong>
                          Use à vontade.<br/>Cancele quando quiser.
                        </td>
                        <td width="33%" style="font-size: 12px; color: #e2e8f0; padding-left: 8px;">
                          <strong style="color: #94a3b8; display: block; margin-bottom: 2px;">Após 7 Dias</strong>
                          Cobrança automática somente se continuar.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${targetUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #090d16; font-size: 16px; font-weight: 900; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); text-align: center;">
                      🚀 Ativar Meus 7 Dias Grátis Agora
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Disclaimer -->
              <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0 0 24px 0; line-height: 1.4;">
                🛡️ Processamento seguro via <strong>Stripe</strong>. Você pode cancelar sua assinatura com 1 clique a qualquer momento antes do 7º dia.
              </p>

              <!-- Footer Divider -->
              <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />

              <!-- Footer Text -->
              <p style="font-size: 12px; color: #475569; text-align: center; margin: 0; line-height: 1.5;">
                Economize Já — Controle Financeiro Inteligente.<br/>
                Dúvidas? Responda a este e-mail que estamos à disposição!
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject: '🎁 {{ contact.FIRSTNAME | default: "Economizador" }}, você ganhou 7 dias grátis do Plano PRO!',
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
