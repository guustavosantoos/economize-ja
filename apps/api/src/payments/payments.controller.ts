import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth('access-token')
  @Post('checkout-session')
  @ApiOperation({ summary: 'Criar sessão de checkout do Stripe para assinatura PRO (suporta trialDays)' })
  createCheckoutSession(
    @CurrentUser() user: any,
    @Body('cycle') cycle: 'monthly' | 'quarterly' | 'annual',
    @Body('trialDays') trialDays?: number,
  ) {
    return this.paymentsService.createCheckoutSession(
      user.id,
      user.email,
      cycle || 'monthly',
      trialDays !== undefined ? Number(trialDays) : undefined,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('customer-portal')
  @ApiOperation({ summary: 'Criar sessão do Portal do Cliente da Stripe para gerenciar cartão e faturas' })
  createCustomerPortalSession(@CurrentUser() user: any) {
    return this.paymentsService.createCustomerPortalSession(user.id, user.email);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook oficial de eventos do Stripe' })
  handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
