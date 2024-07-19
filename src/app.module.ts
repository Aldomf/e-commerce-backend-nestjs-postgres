import { Module } from '@nestjs/common';
import { AuthModule } from './auth-module/auth.module';
import { ProductModule } from './product-module/product.module';
import { OrderModule } from './order-module/order.module';
import { UserModule } from './user-module/user.module';
import { AdminModule } from './admin-module/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { StripeModule } from './stripe/stripe.module';
import { WebhookModule } from './webhook/webhook.module';
import { ShippingAddressModule } from './shipping-address/shipping-address.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewModule } from './review/review.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.POSTGRES_SSL === 'true',
      extra: {
        ssl:
          process.env.POSTGRES_SSL === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },
    }),
    AuthModule,
    ProductModule,
    OrderModule,
    UserModule,
    AdminModule,
    CategoryModule,
    CartModule,
    PaymentModule,
    StripeModule,
    WebhookModule,
    ShippingAddressModule,
    WishlistModule,
    ReviewModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'uploads'), // Specify the root path for static content
      serveRoot: '/', // Serve files from the root URL without appending index.html
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
