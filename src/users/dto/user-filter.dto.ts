import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'src/auth/constants/role.constants';
import { UserStatus } from '../entities/user.entity';

export class UserFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): UserRole[] => {
    const rawEntries = Array.isArray(value) ? value : [value];

    return rawEntries.map((val): UserRole => {
      const stringVal = String(val);

      // Safe reflection lookup mirroring Java's valueOf()
      if (stringVal in UserRole) {
        return UserRole[stringVal as keyof typeof UserRole];
      }

      // Fallback fallback casting
      return stringVal as UserRole;
    });
  })
  @IsArray()
  roles?: UserRole[];

  @IsOptional()
  @Transform(({ value }: { value: unknown }): UserStatus[] => {
    const rawEntries = Array.isArray(value) ? value : [value];

    return rawEntries.map((val): UserStatus => {
      // Force incoming parameter to uppercase to ensure it matches the Enum keys (e.g., 'active' -> 'ACTIVE')
      const stringKey = String(val).toUpperCase();

      // Look up uppercase key ("ACTIVE") -> return true database value ("active")
      if (stringKey in UserStatus) {
        return UserStatus[stringKey as keyof typeof UserStatus];
      }

      return String(val) as UserStatus;
    });
  })
  @IsArray()
  statuses?: UserStatus[];
}
