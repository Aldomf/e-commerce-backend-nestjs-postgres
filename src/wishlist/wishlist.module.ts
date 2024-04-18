import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AuthModule } from 'src/auth-module/auth.module';
import { User } from 'src/user-module/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product-module/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, ProductModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
