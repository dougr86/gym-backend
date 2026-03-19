import {
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ScheduleStatus } from '../entities/class-schedule.entity';

export class CreateClassScheduleDto {
  @IsUUID()
  classTypeId: string;

  @IsUUID()
  roomId: string;

  @IsUUID()
  instructorId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  @IsOptional()
  maxCapacity?: number; // If empty, we'll pull from ClassType default

  @IsBoolean()
  @IsOptional()
  isSpecialEvent?: boolean = false;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus = ScheduleStatus.SCHEDULED;
}
