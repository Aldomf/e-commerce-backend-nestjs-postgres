import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
//import { Status } from 'src/common/enums/status.enum';
import { Order } from './entities/order.entity';
import { AuthGuard } from 'src/auth-module/guard/auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Status } from 'src/common/enums/status.enum';

@ApiTags('orders')
@Controller('orders')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'User needs to be authenticated' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':userId/:id')
  //@UseGuards(AdminGuard)
  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.orderService.findOne(+userId, +id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Patch(':userId/:id/status')
  async updateOrderStatus(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<Order> {
    const result = await this.orderService.updateOrderStatus(+userId, +id);
    if ('error' in result) {
      // If error object is returned, throw an HttpException with the error message
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    // If an Order object is returned, return it
    return result;
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  async updateOrderStatusAdmin(
    @Param('id') id: string,
    @Body() body: { newStatus: Status }, // Expecting new status from the request body
  ): Promise<Order> {
    const { newStatus } = body;

    const result = await this.orderService.updateOrderStatusAdmin(
      +id,
      newStatus,
    );

    if ('error' in result) {
      // If error object is returned, throw an HttpException with the error message
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    // If an Order object is returned, return it
    return result;
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }

  @Get(':userId')
  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  async findOrdersByUserId(@Param('userId') userId: string) {
    try {
      const orders = await this.orderService.findOrdersByUserId(
        parseInt(userId, 10),
      );
      return { orders };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return { error: error.message };
      }
      throw error; // Let other errors propagate
    }
  }
}
