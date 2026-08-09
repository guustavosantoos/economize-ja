import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import axios from 'axios';

@Injectable()
export class MailService {
  private resend?: Resend;

  constructor(private configService: ConfigService) {
    const resendKey = this.configService.get('RESEND_API_KEY');
    if (resendKey && resendKey !== 'mock' && resendKey !== 'change-me') {
      this.resend = new Resend(resendKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (this.configService.get('NODE_ENV') === 'test') return;

    console.log(`\n================ E-MAIL DISPARADO ================`);
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`==================================================\n`);

    const brevoApiKey = this.configService.get('BREVO_API_KEY');
    const senderEmail = this.configService.get('MAIL_FROM_EMAIL') || 'guuh.santos153@gmail.com';
    const senderName = this.configService.get('MAIL_FROM_NAME') || 'Economize Já';

    const formattedHtml = html.includes('<html') || html.includes('<div')
      ? html
      : `
        <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
          <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #003535; font-size: 22px; font-weight: 800; margin: 0;">Economize Já</h1>
              <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Seu controle financeiro pessoal</p>
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #334155;">
              ${html.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">Este e-mail foi enviado automaticamente pelo Economize Já.</p>
          </div>
        </div>
      `;

    // 1. Brevo REST API
    if (brevoApiKey) {
      try {
        const response = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: formattedHtml,
          },
          {
            headers: {
              'api-key': brevoApiKey.trim(),
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        console.log(`[Brevo Success] E-mail enviado para ${to}! MessageId: ${response.data?.messageId || 'OK'}`);
        return;
      } catch (err: any) {
        console.error('[Brevo Error Status]:', err?.response?.status);
        console.error('[Brevo Error Data]:', JSON.stringify(err?.response?.data || err.message));
      }
    }

    // 2. Resend API Fallback
    if (this.resend) {
      const fromAddress = this.configService.get('MAIL_FROM') || 'Economize Já <onboarding@resend.dev>';
      try {
        await this.resend.emails.send({
          from: fromAddress,
          to,
          subject,
          html: formattedHtml,
        });
        console.log(`[Resend Success] E-mail enviado para ${to}!`);
      } catch (e) {
        console.error('Falha ao enviar e-mail via Resend:', e);
      }
    }
  }
}
