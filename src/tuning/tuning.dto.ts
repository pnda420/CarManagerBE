// tuning/tuning.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  IsDateString,
  IsPositive,
} from 'class-validator';

export enum ModStatus {
  PLANNED = 'planned',
  ORDERED = 'ordered',
  INSTALLED = 'installed',
  DISCARDED = 'discarded',
}

// TuningGroup DTOs
export class CreateTuningGroupDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  budgetEur?: number;
}

export class UpdateTuningGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  budgetEur?: number;
}

// TuningPart DTOs
export class CreateTuningPartDto {
  @IsString()
  groupId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ModStatus)
  status: ModStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPriceEur?: number;

  @IsNumber()
  @IsOptional()
  laborPriceEur?: number;

  @IsNumber()
  @IsOptional()
  totalPriceEur?: number;

  @IsString()
  @IsOptional()
  link?: string;
}

export class UpdateTuningPartDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ModStatus)
  @IsOptional()
  status?: ModStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderIndex?: number;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPriceEur?: number;

  @IsNumber()
  @IsOptional()
  laborPriceEur?: number;

  @IsNumber()
  @IsOptional()
  totalPriceEur?: number;

  @IsString()
  @IsOptional()
  link?: string;
}