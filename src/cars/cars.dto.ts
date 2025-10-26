// cars/cars.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
  IsDateString,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
  LPG = 'lpg',
  CNG = 'cng',
  OTHER = 'other',
}

export enum Induction {
  NONE = 'none',
  TURBO = 'turbo',
  SUPERCHARGER = 'supercharger',
  ELECTRIC = 'electric',
  OTHER = 'other',
}

export enum Drivetrain {
  FWD = 'fwd',
  RWD = 'rwd',
  AWD = 'awd',
}

export enum Transmission {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  DSG = 'dsg',
  CVT = 'cvt',
  OTHER = 'other',
}

export enum BodyType {
  SEDAN = 'sedan',
  WAGON = 'wagon',
  COUPE = 'coupe',
  CONVERTIBLE = 'convertible',
  SUV = 'suv',
  VAN = 'van',
  PICKUP = 'pickup',
  HATCHBACK = 'hatchback',
  OTHER = 'other',
}

class CarImageDto {
  @IsString()
  id: string;

  @IsString()
  image: string;
}

export class CreateCarDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(100)
  make: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  modelYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  licensePlate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  vin?: string;

  @IsInt()
  @IsPositive()
  horsepowerPs: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  torqueNm?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  displacementCc?: number;

  @IsEnum(FuelType)
  fuel: FuelType;

  @IsEnum(Induction)
  @IsOptional()
  induction?: Induction;

  @IsEnum(Drivetrain)
  @IsOptional()
  drivetrain?: Drivetrain;

  @IsEnum(Transmission)
  @IsOptional()
  transmission?: Transmission;

  @IsInt()
  @IsOptional()
  @Min(1)
  gears?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  kerbWeightKg?: number;

  @IsInt()
  @IsOptional()
  @Min(2)
  doors?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  seats?: number;

  @IsEnum(BodyType)
  @IsOptional()
  bodyType?: BodyType;

  @IsInt()
  @Min(0)
  mileageKm: number;

  @IsDateString()
  @IsOptional()
  nextTuvDate?: string;

  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  nextServiceKm?: number;

  @IsNumber()
  @IsOptional()
  powerToWeightPsPerKg?: number;

  @IsNumber()
  @IsOptional()
  zeroToHundredS?: number;

  @IsInt()
  @IsOptional()
  topSpeedKmh?: number;

  @IsNumber()
  @IsOptional()
  consumptionLPer100km?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarImageDto)
  @IsOptional()
  images?: CarImageDto[];
}

export class UpdateCarDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  make?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  modelYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  licensePlate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  vin?: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  horsepowerPs?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  torqueNm?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  displacementCc?: number;

  @IsEnum(FuelType)
  @IsOptional()
  fuel?: FuelType;

  @IsEnum(Induction)
  @IsOptional()
  induction?: Induction;

  @IsEnum(Drivetrain)
  @IsOptional()
  drivetrain?: Drivetrain;

  @IsEnum(Transmission)
  @IsOptional()
  transmission?: Transmission;

  @IsInt()
  @IsOptional()
  @Min(1)
  gears?: number;

  @IsInt()
  @IsOptional()
  @IsPositive()
  kerbWeightKg?: number;

  @IsInt()
  @IsOptional()
  @Min(2)
  doors?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  seats?: number;

  @IsEnum(BodyType)
  @IsOptional()
  bodyType?: BodyType;

  @IsInt()
  @IsOptional()
  @Min(0)
  mileageKm?: number;

  @IsDateString()
  @IsOptional()
  nextTuvDate?: string;

  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  nextServiceKm?: number;

  @IsNumber()
  @IsOptional()
  powerToWeightPsPerKg?: number;

  @IsNumber()
  @IsOptional()
  zeroToHundredS?: number;

  @IsInt()
  @IsOptional()
  topSpeedKmh?: number;

  @IsNumber()
  @IsOptional()
  consumptionLPer100km?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarImageDto)
  @IsOptional()
  images?: CarImageDto[];
}