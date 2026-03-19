import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateClassTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(5)
  @Max(480)
  @IsOptional()
  defaultDuration?: number = 60;

  @IsString()
  @IsOptional()
  intensity?: string;

  @IsBoolean()
  @IsOptional()
  requiresBooking?: boolean = false;

  @IsBoolean()
  @IsOptional()
  allowWaitlist?: boolean = false;

  @IsInt()
  @Min(1)
  @IsOptional()
  defaultMaxCapacity?: number = 20;
}
