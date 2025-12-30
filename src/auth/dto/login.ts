import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // This field accepts either an email address or a phone number
  // The frontend always sends the key as "email" but the value may be either
  @IsString()
  @IsNotEmpty({ message: 'Email or phone number is required' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
