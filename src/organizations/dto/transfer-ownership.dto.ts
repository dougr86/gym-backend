import {
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/auth/constants/role.constants';

export class TransferOwnershipDto {
  @IsUUID()
  @IsNotEmpty()
  newOwnerId: string;

  // If not provided, we default to ADMIN in the service
  @IsEnum(UserRole)
  @IsOptional()
  newRoleForOldOwner?: UserRole;

  // Flag to deactivate the old owner immediately
  @IsBoolean()
  @IsOptional()
  shouldDeactivate?: boolean;
}
