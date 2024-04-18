import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoryModule } from 'src/category/category.module';
import { OrderModule } from 'src/order-module/order.module';
import { AuthModule } from 'src/auth-module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoryModule,
    OrderModule,
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule.forFeature([Product]), ProductService],
})
export class ProductModule {}
