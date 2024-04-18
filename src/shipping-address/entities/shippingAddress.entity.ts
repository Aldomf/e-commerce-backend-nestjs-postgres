import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user-module/entities/user.entity';

@Entity()
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  mobile: string;

  // One-to-One relationship with user
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
