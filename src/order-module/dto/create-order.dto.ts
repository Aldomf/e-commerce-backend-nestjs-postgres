import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Product } from 'src/product-module/entities/product.entity';
import { Status } from 'src/common/enums/status.enum';

export class CreateOrderDto {
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  products: Product[];

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsEnum(Status)
  status: Status;
}
