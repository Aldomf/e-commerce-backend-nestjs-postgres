import { IsString, Length, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsOptional() // Mark description as optional
  @IsString()
  @Length(0, 255)
  description?: string;
}
