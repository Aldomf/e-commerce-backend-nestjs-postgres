import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShippingAddress } from './entities/shippingAddress.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user-module/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShippingAddressDto } from './dto/createShippingAddress.dto';
import { UpdateShippingAddressDto } from './dto/updateShippingAddress.dto';

@Injectable()
export class ShippingAddressService {
  constructor(
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    createShippingAddressDto: CreateShippingAddressDto,
  ): Promise<ShippingAddress> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['shippingAddress'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user already has a shipping address
    if (user.shippingAddress) {
      throw new BadRequestException('User already has a shipping address');
    }

    const shippingAddress = new ShippingAddress();
    shippingAddress.street = createShippingAddressDto.street;
    shippingAddress.city = createShippingAddressDto.city;
    shippingAddress.state = createShippingAddressDto.state;
    shippingAddress.country = createShippingAddressDto.country;
    shippingAddress.postalCode = createShippingAddressDto.postalCode;
    shippingAddress.mobile = createShippingAddressDto.mobile;
    shippingAddress.user = user;

    return await this.shippingAddressRepository.save(shippingAddress);
  }

  async update(
    userId: number,
    updateShippingAddressDto: UpdateShippingAddressDto,
  ): Promise<ShippingAddress> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['shippingAddress'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user has a shipping address
    if (!user.shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    const shippingAddress = user.shippingAddress;
    shippingAddress.street = updateShippingAddressDto.street;
    shippingAddress.city = updateShippingAddressDto.city;
    shippingAddress.state = updateShippingAddressDto.state;
    shippingAddress.country = updateShippingAddressDto.country;
    shippingAddress.postalCode = updateShippingAddressDto.postalCode;
    shippingAddress.mobile = updateShippingAddressDto.mobile;

    return await this.shippingAddressRepository.save(shippingAddress);
  }

  async findOne(userId: number): Promise<ShippingAddress> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['shippingAddress'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const shippingAddress = user.shippingAddress;
    if (!shippingAddress) {
      throw new NotFoundException('Shipping address not found');
    }

    return shippingAddress;
  }

  async findAll(): Promise<ShippingAddress[]> {
    const shippingAddresses = await this.shippingAddressRepository.find();
    return shippingAddresses;
  }
}
