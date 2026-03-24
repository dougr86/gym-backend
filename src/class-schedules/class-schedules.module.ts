import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ClassTypesModule } from 'src/class-types/class-types.module';
import {
  ScheduleConfigurationEntity,
  ClassScheduleEntity,
  BookingEntity,
  ScheduleConfigurationsController,
  ClassSchedulesController,
  BookingsController,
  ScheduleConfigurationsService,
  ClassSchedulesService,
  BookingsService,
} from './index';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleCronService } from './services/schedule-cron-service';
import { RoomEntity } from 'src/rooms/entities/room.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      ScheduleConfigurationEntity,
      ClassScheduleEntity,
      BookingEntity,
      RoomEntity,
    ]),
    ClassTypesModule,
    RoomsModule,
  ],
  controllers: [
    ScheduleConfigurationsController,
    ClassSchedulesController,
    BookingsController,
  ],
  providers: [
    ScheduleConfigurationsService,
    ClassSchedulesService,
    BookingsService,
    ScheduleCronService,
  ],
  exports: [
    ScheduleConfigurationsService,
    ClassSchedulesService,
    BookingsService,
  ],
})
export class ClassSchedulesModule {}
