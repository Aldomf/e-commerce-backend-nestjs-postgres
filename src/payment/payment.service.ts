import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stripe } from 'stripe';
import { User } from 'src/user-module/entities/user.entity';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cartService: CartService,
  ) {}

  async handlePaymentSuccess(event: Stripe.Event) {
    const userId = this.getUserIdFromEvent(event);
    if (!userId) {
      console.error('User ID not found in the Stripe event');
      return;
    }
    console.log(userId);

    // Convert userId to a number if it's a string
    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      console.error('Invalid user ID:', userId);
      return;
    }

    // Clear the user's cart after successful payment
    try {
      await this.cartService.clearCart(userIdNumber);
      console.log('Cart cleared for user:', userIdNumber);
    } catch (error) {
      console.error('Error clearing cart for user:', userIdNumber, error);
    }
  }

  // Function to extract user ID from the Stripe event metadata
  private getUserIdFromEvent(event: Stripe.Event): string | undefined {
    // Check if the event contains the metadata property
    if ('metadata' in event.data?.object) {
      // Extract user ID from metadata
      console.log(event.data?.object.metadata?.userId);
      return event.data?.object.metadata?.userId;
    }
    return undefined;
  }
}
