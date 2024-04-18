import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CartModule } from 'src/cart/cart.module';
import { StripeController } from './stripe.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { UserModule } from 'src/user-module/user.module';
import { OrderModule } from 'src/order-module/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order-module/entities/order.entity';
import { ProductModule } from 'src/product-module/product.module';
import { AuthModule } from 'src/auth-module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CartModule,
    UserModule,
    OrderModule,
    ProductModule,
    AuthModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
