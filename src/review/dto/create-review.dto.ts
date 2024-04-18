import { IsInt, IsNotEmpty, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @MinLength(5)
  comment: string;
}
