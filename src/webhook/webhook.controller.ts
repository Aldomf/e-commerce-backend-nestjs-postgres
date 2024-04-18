import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StripeService } from 'src/stripe/stripe.service';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe')
  handleStripeWebhook(@Body() payload: any) {
    // Forward the payload to the Stripe service for processing
    this.stripeService.handlePaymentWebhook(payload);
  }
}
