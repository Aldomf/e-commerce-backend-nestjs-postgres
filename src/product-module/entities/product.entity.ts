import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from 'src/order-module/entities/order.entity';
import { User } from 'src/user-module/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { IsNumber } from 'class-validator';
import { Review } from 'src/review/entities/review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  price: number;

  @Column({ default: true, nullable: true })
  inStock: boolean;

  @Column({ default: false, nullable: true })
  hot: boolean;

  @Column({ default: false, nullable: true })
  sale: boolean;

  @Column({ default: false, nullable: true })
  new: boolean;

  @Column()
  imageUrl: string;

  @Column({ nullable: true }) // Nullable because not all products have discounts
  @IsNumber()
  discountPercentage: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  priceWithDiscount: number;

  @Column({ default: false }) // Define the discountActive property
  discountActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToMany(() => User, (user) => user.wishlist)
  usersInWishlist: User[];

  @ManyToMany(() => User, (user) => user.cartList)
  usersInCartList: User[];

  @ManyToMany(() => Order, (order) => order.products)
  orders: Order[];

  // One-to-Many relationship with product's reviews
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
