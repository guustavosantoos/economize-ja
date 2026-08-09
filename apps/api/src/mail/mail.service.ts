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

    // 1. Brevo REST API (Suporta envio gratuito para qualquer e-mail sem precisar de domínio pago)
    if (brevoApiKey) {
      try {
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html.replace(/\n/g, '<br/>'),
          },
          {
            headers: {
              'api-key': brevoApiKey,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        console.log(`[Brevo] E-mail enviado com sucesso para ${to}!`);
        return;
      } catch (err: any) {
        console.error('[Brevo Error]:', err?.response?.data || err.message);
      }
    }

    // 2. Resend API
    if (this.resend) {
      const fromAddress = this.configService.get('MAIL_FROM') || 'Economize Já <onboarding@resend.dev>';
      try {
        await this.resend.emails.send({
          from: fromAddress,
          to,
          subject,
          html,
        });
        console.log(`[Resend] E-mail enviado para ${to}!`);
      } catch (e) {
        console.error('Falha ao enviar e-mail via Resend:', e);
      }
    }
  }
}
