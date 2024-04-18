import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto } from './dto/createShippingAddress.dto';
import { UpdateShippingAddressDto } from './dto/updateShippingAddress.dto';
import { ShippingAddress } from './entities/shippingAddress.entity';
import { AuthGuard } from 'src/auth-module/guard/auth.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';

@ApiTags('shipping-address')
@ApiBearerAuth()
@Controller('shipping-address')
@UseGuards(AuthGuard)
export class ShippingAddressController {
  constructor(
    private readonly shippingAddressService: ShippingAddressService,
  ) {}

  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Post(':userId')
  async createShippingAddress(
    @Param('userId') userId: number,
    @Body() createShippingAddressDto: CreateShippingAddressDto,
  ) {
    const shippingAddress = await this.shippingAddressService.create(
      userId,
      createShippingAddressDto,
    );
    return shippingAddress;
  }

  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Patch(':userId')
  async updateShippingAddress(
    @Param('userId') userId: number,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto,
  ) {
    const shippingAddress = await this.shippingAddressService.update(
      userId,
      updateShippingAddressDto,
    );
    return shippingAddress;
  }

  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Get(':userId')
  async findOne(@Param('userId') userId: number): Promise<ShippingAddress> {
    return this.shippingAddressService.findOne(userId);
  }

  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @Get()
  async findAll(): Promise<ShippingAddress[]> {
    return this.shippingAddressService.findAll();
  }
}
