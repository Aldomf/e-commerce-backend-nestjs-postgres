import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductModule } from 'src/product-module/product.module';
import { UserModule } from 'src/user-module/user.module';
import { CartListItem } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth-module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartListItem]),
    ProductModule,
    UserModule,
    AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
