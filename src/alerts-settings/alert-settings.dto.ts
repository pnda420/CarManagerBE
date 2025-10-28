// users/alert-settings.dto.ts
import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateAlertSettingsDto {
  @IsBoolean()
  @IsOptional()
  alertsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  tuvAlertEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  serviceAlertEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  mileageAlertEnabled?: boolean;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  tuvDaysBefore?: number;

  @IsInt()
  @Min(1)
  @Max(180)
  @IsOptional()
  serviceDaysBefore?: number;

  @IsInt()
  @Min(100)
  @Max(10000)
  @IsOptional()
  serviceKmBefore?: number;

  @IsInt()
  @Min(1000)
  @IsOptional()
  mileageTargetKm?: number;
}