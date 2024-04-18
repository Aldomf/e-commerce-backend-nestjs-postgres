import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import { Status } from 'src/common/enums/status.enum';
import { Order } from 'src/order-module/entities/order.entity';
import { PaymentService } from 'src/payment/payment.service';
import { Product } from 'src/product-module/entities/product.entity';
import { User } from 'src/user-module/entities/user.entity';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { CartListItem } from 'src/cart/entities/cart.entity';

interface BillingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2023-10-16', // Use the Stripe API version you want to work with
    });
  }

  async createCheckoutSession(userId: number) {
    console.log(userId);
    const items = await this.cartService.constructItemsArray(userId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['shippingAddress'],
    });

    const shippingAddress = user.shippingAddress; // Assuming the user has only one shipping address
    console.log(shippingAddress);
    if (!shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: [item.imageUrl],
          },
          unit_amount: parseFloat((item.price * 100).toFixed(2)),
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId,
      },
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/api/checkout/cancel',
      client_reference_id: userId.toString(),
      billing_address_collection: 'required', // Require the customer to enter their shipping address
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX'], // Assuming allowed countries
      },
    });
    // Log the image URL in the console
    console.log('Image URL:', items[0].imageUrl);

    return session;
  }

  // async handlePaymentWebhook(payload: any) {
  //   // Log the entire payload received from Stripe
  //   console.log('Received Stripe Webhook Payload:', payload);

  //   // Extract the event type
  //   const eventType = payload.type;

  //   // Handle payment succeeded event
  //   if (eventType === 'checkout.session.completed') {
  //     // Call handlePaymentSuccess method to clear user's cart
  //     await this.paymentService.handlePaymentSuccess(payload);
  //   }
  //   // Add more conditions to handle other webhook events if needed
  // }

  async handlePaymentWebhook(payload: any) {
    // Log the entire payload received from Stripe
    console.log('Received Stripe Webhook Payload:', payload);

    // Extract the event type
    const eventType = payload.type;

    // Handle payment succeeded event
    if (eventType === 'checkout.session.completed') {
      // Extract session ID
      const sessionId = payload.data.object.id;

      try {
        // Retrieve session details from Stripe
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        // Extract user ID from session metadata
        const userIdString = session.metadata.userId;
        if (!userIdString) {
          throw new Error('User ID not found in session metadata');
        }

        const userId = parseInt(userIdString);
        if (isNaN(userId)) {
          throw new Error('Invalid user ID in session metadata');
        }

        // Extract billing address from the session data
        const billingAddress = session.customer_details.address;

        // Extract payment method types from the session data
        const paymentMethodTypes: string[] = session.payment_method_types;

        // Get the first element of the payment method types array
        const paymentInformation = paymentMethodTypes[0]; // Get the first element of the array
        console.log('Card Payment Method:', paymentInformation);

        // Create order using userId, billingAddress, and paymentMethodTypes
        await this.createOrder(userId, billingAddress, paymentInformation);

        // Await payment handling
        await this.paymentService.handlePaymentSuccess(payload);
      } catch (error) {
        console.error(
          'Error handling payment success or creating order:',
          error,
        );
        // Handle error if necessary
      }
    }
    // Add more conditions to handle other webhook events if needed
  }

  async createOrder(
    userId: number,
    billingAddress: BillingAddress,
    paymentInformation: string,
  ) {
    const items = await this.cartService.constructItemsArray(userId);

    // Fetch cart items for the user using your service or method
    const cartItems: CartListItem[] =
      await this.cartService.getCartItems(userId);

    // Retrieve user and shipping address
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['shippingAddress'],
    });

    // Check if the user has a shipping address
    if (!user.shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    // Get the shipping address from the user
    const shippingAddress = user.shippingAddress;

    // Calculate total price based on cart items
    const totalPrice = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    // Create order entity
    const order = new Order();
    order.userId = userId;
    order.quantity = items.reduce((total, item) => total + item.quantity, 0); // Calculate total quantity
    order.totalPrice = totalPrice;
    order.orderStatus = Status.Pending;
    order.shippingAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}, ${shippingAddress.postalCode}`;
    order.billingAddress = `${billingAddress.line1}, ${billingAddress.city}, ${billingAddress.state}, ${billingAddress.country}, ${billingAddress.postal_code}`;
    order.paymentInformation = paymentInformation;
    order.orderDate = new Date();

    // Associate products with the order
    order.products = []; // Initialize products array
    for (const item of cartItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (product) {
        order.products.push(product);
      }
    }

    // Save order entity to the database
    try {
      await this.orderRepository.save(order);
    } catch (error) {
      // Handle error
      throw new Error('Failed to save order');
    }
  }
}
