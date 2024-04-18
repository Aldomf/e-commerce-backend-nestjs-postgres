import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user-module/user.module';
import { AuthModule } from 'src/auth-module/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), UserModule, AuthModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, TypeOrmModule.forFeature([Order])],
})
export class OrderModule {}
