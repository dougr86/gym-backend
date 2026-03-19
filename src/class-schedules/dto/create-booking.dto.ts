import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsUUID()
  scheduleId: string;

  @IsUUID()
  userId: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus = BookingStatus.RESERVED;
}
