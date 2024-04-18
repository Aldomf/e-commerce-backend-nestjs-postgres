import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new adminModule';
  }

  findAll() {
    return `This action returns all adminModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminModule`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} adminModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminModule`;
  }
}
