import {
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { UserGender } from '../entities/user.entity';

export class OnboardUserDto {
  @IsString()
  invitationToken: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date string' },
  )
  birthDate: string;

  @IsString()
  @IsOptional()
  governmentId: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @IsString() @IsOptional() addressLine1?: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() stateProvince?: string;
  @IsString() @IsOptional() postalCode?: string;
  @IsString() @IsOptional() preferredLanguage?: string;
}
