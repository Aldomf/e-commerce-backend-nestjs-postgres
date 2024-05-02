import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserModuleDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }

  async findAll() {
    return await this.userRepository.find({
      relations: ['wishlist', 'cartList'],
    });
  }

  async findOne(id: number) {
    const foundUser = await this.userRepository.findOne({
      where: { id },
      relations: ['wishlist', 'cartList', 'orders', 'orders.products'],
    });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  async update(user: User) {
    return await this.userRepository.save(user);
  }
}
