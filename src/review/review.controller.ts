import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { AuthGuard } from 'src/auth-module/guard/auth.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(UserIdGuard)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Post(':userId/:productId')
  create(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewService.create(userId, productId, createReviewDto);
  }

  @UseGuards(UserIdGuard)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Patch('/:userId/:id')
  async updateUserComment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewService.updateUserComment(userId, id, updateReviewDto);
  }

  @UseGuards(UserIdGuard)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Delete('/:userId/:id')
  async deleteUserComment(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) reviewId: number,
  ): Promise<void> {
    await this.reviewService.deleteUserComment(userId, reviewId);
  }

  @Get(':productId/comments')
  async findAllUserComments(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Review[]> {
    return this.reviewService.findAllUserComments(productId);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @Get()
  findAll(): Promise<Review[]> {
    return this.reviewService.findAll();
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewService.update(id, updateReviewDto);
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin access required for this endpoint' })
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.reviewService.remove(id);
  }
}
