import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  private readonly priceIds = {
    monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_1U2yR2E9XImvwlRip6awmtC2',
    quarterly: process.env.STRIPE_PRICE_QUARTERLY || 'price_1U2yR2E9XImvwlRi0bwoCY4U',
    annual: process.env.STRIPE_PRICE_ANNUAL || 'price_1U2yR3E9XImvwlRiRaQkNqzg',
  };

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.STRIPE_SECRET_KEY || '';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  async createCheckoutSession(userId: string, email: string, cycle: 'monthly' | 'quarterly' | 'annual') {
    const priceId = this.priceIds[cycle] || this.priceIds.annual;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://economize-ja-production.up.railway.app';

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          cycle,
        },
        success_url: `${appUrl}/pro?success=true`,
        cancel_url: `${appUrl}/pro?canceled=true`,
      });

      return { url: session.url };
    } catch (err: any) {
      this.logger.error('Erro ao criar Checkout Session no Stripe', err.stack);
      throw new BadRequestException(`Erro no Stripe: ${err.message}`);
    }
  }

  async handleWebhook(body: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (webhookSecret && signature) {
        event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        event = JSON.parse(body.toString());
      }
    } catch (err: any) {
      this.logger.error('Falha na validação da assinatura do Webhook Stripe', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Stripe Event Recebido: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        this.logger.log(`Promovendo usuário ${userId} para o Plano PRO!`);
        await this.prisma.user.update({
          where: { id: userId },
          data: { plan: 'pro' },
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerEmail = (subscription as any).customer_email;

      if (customerEmail) {
        this.logger.log(`Assinatura cancelada para ${customerEmail}. Retornando plano para Free.`);
        const user = await this.prisma.user.findFirst({ where: { email: customerEmail } });
        if (user) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { plan: 'free' },
          });
        }
      }
    }

    return { received: true };
  }
}
