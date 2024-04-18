import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from 'src/auth-module/guard/auth.guard';
import { UserIdGuard } from 'src/common/guards/userId.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(UserIdGuard)
@UseGuards(AuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Post(':userId/add-product-to-wishlist/:productId')
  async addProductToWishlist(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    try {
      await this.wishlistService.addProductToWishlist(userId, productId);
      return { message: 'Product added to user wishlist successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: error.message };
      }
      throw error; // Let other errors propagate
    }
  }

  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Delete(':userId/delete-product-from-wishlist/:productId')
  async deleteProductFromWishlist(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ) {
    try {
      await this.wishlistService.deleteProductFromWishlist(userId, productId);
      return { message: 'Product deleted from user wishlist successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: error.message };
      }
      throw error; // Let other errors propagate
    }
  }

  @ApiOperation({ summary: 'Endpoint reserved for specific user' })
  @Get('user/:userId')
  async findOneWishlist(@Param('userId') userId: string) {
    try {
      const wishlist = await this.wishlistService.findOneWishlist(
        parseInt(userId, 10),
      );
      return { wishlist };
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
