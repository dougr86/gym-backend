import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsUUID,
  IsISO31661Alpha2,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from 'src/auth/constants/role.constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  governmentId?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  // We make role optional here because the Service
  // will often force it to 'STUDENT' or 'OWNER'
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsUUID()
  @IsOptional() // Optional because the Service might provide it via authUser
  organizationId?: string;

  // New: Specific user country and phone
  @IsISO31661Alpha2()
  @IsOptional()
  countryCode?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string; // Expects E.164 format like '+50688888888'

  @IsString() @IsOptional() addressLine1?: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() stateProvince?: string;
  @IsString() @IsOptional() postalCode?: string;
}
