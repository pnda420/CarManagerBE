import { IsEmail, IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' })
  password: string;

  @IsBoolean()
  @IsOptional()
  wantsNewsletter?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  wantsNewsletter?: boolean;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class NewsletterSubscribeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;
}