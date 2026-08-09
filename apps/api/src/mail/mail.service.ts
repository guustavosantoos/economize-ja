import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resend: Resend;
  
  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY') || 'mock');
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (this.configService.get('NODE_ENV') === 'test') return;
    
    // Log do e-mail no console (útil para ver o código de 6 dígitos nos logs do Railway)
    console.log(`\n================ E-MAIL DISPARADO ================`);
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo:\n${html}`);
    console.log(`==================================================\n`);

    const apiKey = this.configService.get('RESEND_API_KEY');
    if (!apiKey || apiKey === 'mock' || apiKey === 'change-me') {
      return;
    }

    const fromAddress = this.configService.get('MAIL_FROM') || 'Economize Já <noreply@economizeja.com.br>';

    try {
      await this.resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
      });
    } catch (e) {
      console.warn('Tentando fallback via onboarding@resend.dev...', e);
      try {
        await this.resend.emails.send({
          from: 'Economize Já <onboarding@resend.dev>',
          to,
          subject,
          html,
        });
      } catch (err) {
        console.error('Falha ao enviar e-mail via Resend:', err);
      }
    }
  }
}
