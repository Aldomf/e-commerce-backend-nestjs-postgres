import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;

  @IsString()
  token: string;
}
