import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
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
}
