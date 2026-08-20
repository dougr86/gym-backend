import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateOrganizationSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowAdminTaxIdEdit?: boolean;

  @IsOptional()
  @IsInt()
  @Min(15) // Security minimum safeguard
  @Max(1440) // Maximum 24 hours
  sessionTimeoutMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(32)
  passwordMinLength?: number;

  @IsOptional()
  @IsBoolean()
  passwordRequireUppercase?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordRequireNumbers?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordRequireSpecial?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0) // 0 = Feature flag deactivated (Never expire)
  @Max(12) // Maximum 1 year rotation cycle requirement
  passwordMaxAgeMonths?: number;
}
