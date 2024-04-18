import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from 'src/product-module/entities/product.entity';
import { User } from 'src/user-module/entities/user.entity';

@Entity('cart_list_item')
export class CartListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1, type: 'int', unsigned: true }) // Setting unsigned to true ensures non-negativity
  quantity: number;

  @ManyToOne(() => User, (user) => user.cartList)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.usersInCartList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  userId: number;

  @Column()
  productId: number;

  // Add validation to ensure quantity cannot be less than 1
  @BeforeUpdate()
  @BeforeInsert()
  validateQuantity() {
    if (this.quantity < 1) {
      throw new Error('Quantity cannot be less than 1');
    }
  }
}
