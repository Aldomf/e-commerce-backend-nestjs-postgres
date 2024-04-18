import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user-module/entities/user.entity';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => StripeModule),
    CartModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
