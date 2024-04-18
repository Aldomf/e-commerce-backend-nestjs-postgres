import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Status } from 'src/common/enums/status.enum';
import { Product } from 'src/product-module/entities/product.entity';
import { User } from 'src/user-module/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: Status,
    default: Status.Pending,
  })
  orderStatus: Status;

  @Column({ name: 'shipping_address', nullable: true })
  shippingAddress: string;

  @Column({ name: 'billing_address', nullable: true })
  billingAddress: string;

  @Column({ name: 'payment_information', nullable: true })
  paymentInformation: string;

  @Column({
    name: 'order_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  orderDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Many-to-One relationship with user who made the order
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToMany(() => Product, (product) => product.orders)
  @JoinTable({
    name: 'order_product', // Table name for the junction table of this relation
    joinColumn: {
      name: 'order_id', // Name of the column in the junction table that references the Order entity
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id', // Name of the column in the junction table that references the Product entity
      referencedColumnName: 'id',
    },
  })
  products: Product[];
}
