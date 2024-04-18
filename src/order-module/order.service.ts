import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UserService } from 'src/user-module/user.service';
import { Repository } from 'typeorm';
import { Status } from 'src/common/enums/status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['products'] });
  }

  async findOne(userId: number, id: number): Promise<Order | undefined> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['products', 'user', 'user.shippingAddress'],
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<void> {
    await this.orderRepository.update(id, updateOrderDto);
  }

  async remove(id: number): Promise<void> {
    await this.orderRepository.softDelete(id);
  }

  async updateOrderStatus(
    userId: number,
    id: number,
  ): Promise<Order | { error: string }> {
    // Adjust the return type to include error message
    try {
      const order = await this.findOne(userId, id);
      if (!order) {
        throw new Error('Order not found');
      }
      order.orderStatus = Status.Shipped;
      return this.orderRepository.save(order);
    } catch (error) {
      console.error('Error updating order status:', error.message);
      return { error: error.message }; // Return error message in response
    }
  }

  async findOrdersByUserId(userId: number): Promise<Order[]> {
    // Validate userId as a number
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find orders by user ID
    return this.orderRepository.find({
      where: { userId },
      relations: ['products'],
    });
  }
}
