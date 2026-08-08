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
    try {
       await this.resend.emails.send({
        from: 'Economize Já <noreply@economizeja.com>',
        to,
        subject,
        html,
      });
    } catch(e) {
        console.error('Email failed', e);
    }
  }
}
