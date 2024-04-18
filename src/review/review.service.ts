import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { User } from 'src/user-module/entities/user.entity';
import { Product } from 'src/product-module/entities/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    userId: number,
    productId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // Find user and product entities
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Create review entity
    const review = this.reviewRepository.create({
      ...createReviewDto,
      user,
      product,
    });
    return this.reviewRepository.save(review);
  }

  async updateUserComment(
    userId: number,
    id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.findOne(id);
    console.log(review);
    // Check if the review or user is undefined
    if (!review || !review.user) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Check if the user is the owner of the review
    if (review.user.id !== userId) {
      throw new UnauthorizedException(
        "You don't have permission to update this review",
      );
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async deleteUserComment(userId: number, reviewId: number): Promise<void> {
    // Find the review
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });

    // Check if the review exists
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Check if the user is the owner of the review
    if (review.user.id !== userId) {
      throw new UnauthorizedException(
        "You don't have permission to delete this review",
      );
    }

    // Remove the review
    await this.reviewRepository.remove(review);
  }

  async findAllUserComments(productId: number): Promise<Review[]> {
    // Find the product
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['reviews', 'reviews.user'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    // Return the reviews associated with the product
    return product.reviews;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }
}
