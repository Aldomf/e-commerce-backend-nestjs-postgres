import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoryModule } from 'src/category/category.module';
import { OrderModule } from 'src/order-module/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule, OrderModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule.forFeature([Product]), ProductService],
})
export class ProductModule {}
