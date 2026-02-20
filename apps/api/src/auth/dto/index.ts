import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;
}

export class RegisterLawyerDto extends RegisterUserDto {
  @IsString()
  @Matches(/^[A-Z]{2}\/\d{2}\/\d{4,8}$/i, {
    message: 'Enrollment number must be like BR/20/123456 (2 letters / 2 digits / 4–8 digits)',
  })
  enrollmentNo: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}
