import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product-module/entities/product.entity';
import { User } from 'src/user-module/entities/user.entity';
import { Repository } from 'typeorm';
import { CartListItem } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CartListItem)
    private readonly cartListItemRepository: Repository<CartListItem>,
  ) {}

  async addProductToCart(productId: number, userId: number): Promise<void> {
    if (isNaN(userId) || isNaN(productId)) {
      throw new BadRequestException('Invalid user or product ID');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartList'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cartList) {
      user.cartList = [];
    }

    if (!user.cartList.some((element) => element.id === product.id)) {
      user.cartList.push(product);
      await this.userRepository.save(user);

      // Create a new CartListItem entity and save it
      const cartListItem = new CartListItem();
      cartListItem.user = user;
      cartListItem.product = product;
      cartListItem.userId = user.id;
      cartListItem.productId = product.id;
      await this.cartListItemRepository.save(cartListItem);
    }
  }
  // async deleteProductFromCart(
  //   productId: number,
  //   userId: number,
  // ): Promise<void> {
  //   // Validate userId and productId as numbers
  //   if (isNaN(userId) || isNaN(productId)) {
  //     throw new BadRequestException('Invalid user or product ID');
  //   }

  //   const product = await this.productRepository.findOne({
  //     where: { id: productId },
  //   });
  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }

  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     relations: ['cartList'],
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   // Find the index of the product in the cartList array
  //   const index = user.cartList.findIndex(
  //     (product) => product.id === productId,
  //   );
  //   if (index !== -1) {
  //     user.cartList.splice(index, 1);
  //     await this.userRepository.save(user);
  //   }
  // }

  //onDelete CASCADE
  async deleteProductFromCart(
    productId: number,
    userId: number,
  ): Promise<void> {
    // Validate userId and productId as numbers
    if (isNaN(userId) || isNaN(productId)) {
      throw new BadRequestException('Invalid user or product ID');
    }

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartList'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the product in the user's cart
    const productIndex = user.cartList.findIndex(
      (product) => product.id === productId,
    );
    if (productIndex === -1) {
      throw new NotFoundException("Product not found in the user's cart");
    }

    // Remove the product from the user's cart
    const removedProduct = user.cartList.splice(productIndex, 1)[0];

    // Save the updated user (removing the product from the cart list)
    await this.userRepository.save(user);

    // Delete the corresponding entry from cart_list_item table
    await this.cartListItemRepository.delete({
      productId: removedProduct.id,
      userId: user.id,
    });
  }

  async increaseCartItemQuantity(
    userId: number,
    productId: number,
  ): Promise<void> {
    await this.updateCartItemQuantity(userId, productId, 1);
  }

  async decreaseCartItemQuantity(
    userId: number,
    productId: number,
  ): Promise<void> {
    await this.updateCartItemQuantity(userId, productId, -1);
  }

  private async updateCartItemQuantity(
    userId: number,
    productId: number,
    delta: number,
  ): Promise<void> {
    // Check if productId, userId, and delta are valid
    if (isNaN(productId) || isNaN(userId) || isNaN(delta)) {
      throw new BadRequestException(
        'Invalid product, user, or quantity change',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    console.log(user ? user.id : null); // Log user ID or null
    console.log(product ? product.id : null); // Log product ID or null

    // Check if user or product is null
    if (!user || !product) {
      throw new NotFoundException('User or product not found');
    }

    // Find the cart item based on both productId and userId
    const cartItem = await this.cartListItemRepository.findOne({
      where: { userId: user.id, productId: product.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Update the quantity
    cartItem.quantity += delta;

    // Ensure quantity doesn't become negative
    if (cartItem.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    // Save the updated cart item
    await this.cartListItemRepository.save(cartItem);
  }

  async clearCart(userId: number): Promise<void> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartList'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clear the user's cart list
    user.cartList = [];

    // Save the user to update the changes made to the cart list
    await this.userRepository.save(user);

    // Delete the association between products and the user's cart list from the cart_list_item table
    await this.cartListItemRepository.delete({ userId: user.id });
  }

  async constructItemsArray(userId: number) {
    // Fetch user's cart items with product details and quantity
    const cartItems = await this.cartListItemRepository.find({
      where: { userId },
      relations: ['product'],
    });

    // Check if the user exists
    const userExists = await this.cartListItemRepository.findOne({
      where: { userId },
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Now construct the items array with product details and quantity
    const items = cartItems.map((cartItem) => {
      const price =
        cartItem.product.discountActive && cartItem.product.priceWithDiscount
          ? cartItem.product.priceWithDiscount
          : cartItem.product.price;

      return {
        name: cartItem.product.name,
        description: cartItem.product.description,
        price: price,
        quantity: cartItem.quantity,
        imageUrl: cartItem.product.imageUrl,
      };
    });

    return items;
  }

  async getCartItems(userId: number): Promise<CartListItem[]> {
    return await this.cartListItemRepository.find({ where: { userId } });
  }

  async findCartByUserId(userId: number): Promise<Product[]> {
    // Validate userId as a number
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Find user by userId and eagerly load the cartList
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cartList'],
    });

    // Throw NotFoundException if user is not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the cartList is empty
    if (!user.cartList || user.cartList.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    // Return the cartList of the user
    return user.cartList;
  }
}
