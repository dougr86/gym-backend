import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsISO31661Alpha2,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/auth/constants/role.constants';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;

  // New: Specific user country and phone
  @IsISO31661Alpha2()
  @IsOptional()
  countryCode?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string; // Expects E.164 format like '+50688888888'
}
