import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/constants/role.constants';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('bookings')
@UseGuards(RolesGuard)
@Roles(UserRole.STUDENT)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@GetUser() authUser: ActiveUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(authUser, dto);
  }

  @Delete(':id')
  cancel(@GetUser() authUser: ActiveUser, @Param('id') id: string) {
    return this.bookingsService.cancel(authUser, id);
  }

  @Get('my-bookings')
  @Roles(UserRole.STUDENT)
  findAllMyBookings(@GetUser() authUser: ActiveUser) {
    return this.bookingsService.findAllByUser(authUser);
  }

  @Get('schedule/:scheduleId')
  @Roles(UserRole.INSTRUCTOR)
  findRosterBySchedule(
    @GetUser() authUser: ActiveUser,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.bookingsService.findRosterBySchedule(authUser, scheduleId);
  }
}
