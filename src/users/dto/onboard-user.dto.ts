import {
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsISO31661Alpha2,
} from 'class-validator';

export class OnboardUserDto {
  @IsString()
  invitationToken: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  governmentId: string;

  @IsISO31661Alpha2()
  @IsOptional()
  countryCode?: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsString() @IsOptional() addressLine1?: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() stateProvince?: string;
  @IsString() @IsOptional() postalCode?: string;
}
