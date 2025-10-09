import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateGeneratedPageDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(10, { message: 'Page content ist zu kurz' })
  pageContent: string; // Dein langer HTML/Code String

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateGeneratedPageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  pageContent?: string;

  @IsString()
  @IsOptional()
  description?: string;
}