import {
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

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
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  governmentId: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsString() @IsOptional() addressLine1?: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() stateProvince?: string;
  @IsString() @IsOptional() postalCode?: string;
}
