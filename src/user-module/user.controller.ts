import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':userId')
  @UseGuards(UserIdGuard)
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  findOne(@Param('userId') id: string) {
    return this.userService.findOne(+id);
  }
}
