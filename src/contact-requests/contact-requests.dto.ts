import { IsEmail, IsString, IsBoolean, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ServiceType } from './contact-requests.entity';

export class CreateContactRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsString()
  @MaxLength(2000)
  message: string;

  @IsBoolean()
  @IsOptional()
  prefersCallback?: boolean;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  userId?: string; // Falls der User eingeloggt ist
}

export class UpdateContactRequestDto {
  @IsBoolean()
  @IsOptional()
  isProcessed?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}