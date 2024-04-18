import {
  //IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  //Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name must contain only letters, numbers, and spaces',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s.,]+$/, {
    message:
      'Description must contain only letters, numbers, spaces, and punctuation',
  })
  readonly description: string;

  @IsNumberString()
  @IsNotEmpty()
  //@Min(0, { message: 'Price must be greater than or equal to 0' })
  readonly price: number;

  //@IsBoolean()
  @IsOptional()
  readonly inStock?: boolean;

  @IsString()
  @IsNotEmpty()
  readonly category: string;

  //@IsBoolean()
  @IsOptional()
  readonly hot?: boolean;

  //@IsBoolean()
  @IsOptional()
  readonly sale?: boolean;

  //@IsBoolean()
  @IsOptional()
  readonly new?: boolean;

  @IsNumberString()
  @IsOptional()
  readonly discountPercentage?: number;

  @IsString()
  @IsOptional()
  readonly imageUrl?: string;

  //@IsBoolean()
  @IsOptional()
  readonly discountActive?: boolean;
}
