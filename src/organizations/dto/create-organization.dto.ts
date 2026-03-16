import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  ValidateNested,
  IsISO31661Alpha2,
} from 'class-validator';
import { CreateOwnerDto } from './create-owner.dto';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  // New: ISO Country Code (e.g., 'CR', 'US')
  @IsISO31661Alpha2()
  @IsNotEmpty()
  countryCode: string;

  // Optional Organization Address fields
  @IsString() @IsOptional() addressLine1?: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() stateProvince?: string;
  @IsString() @IsOptional() postalCode?: string;

  @ValidateNested()
  @Type(() => CreateOwnerDto)
  @IsNotEmpty()
  owner: CreateOwnerDto;
}
