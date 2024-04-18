import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from 'src/auth-module/guard/auth.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('checkout')
@ApiBearerAuth()
@Controller('checkout')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(UserIdGuard)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Post('/session/:userId')
  async createCheckoutSession(@Param('userId') userId: number) {
    try {
      const session = await this.stripeService.createCheckoutSession(userId);
      return { session }; // Return the session object created by Stripe
    } catch (error) {
      return { error: error.message }; // Return any errors encountered
    }
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User needs to be authenticated' })
  @Get('/success')
  handleSuccess() {
    return 'Payment successful!';
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User needs to be authenticated' })
  @Get('/cancel')
  handleCancel() {
    return 'Payment canceled!';
  }
}
