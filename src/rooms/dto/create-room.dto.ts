import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "Weight Room", "Yoga Studio"

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  capacity: number;

  @IsUUID()
  @IsNotEmpty()
  locationId: string; // The specific branch this room belongs to
}
