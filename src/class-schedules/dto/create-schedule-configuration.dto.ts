import {
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateScheduleConfigurationDto {
  @IsUUID()
  classTypeId: string;

  @IsUUID()
  roomId: string;

  @IsUUID()
  instructorId: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true }) // 0 = Sunday
  @Max(6, { each: true }) // 6 = Saturday
  daysOfWeek: number[];

  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/, {
    message: 'startTime must be HH:mm:ss',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/, {
    message: 'endTime must be HH:mm:ss',
  })
  endTime: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
