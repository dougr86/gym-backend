import { Module } from '@nestjs/common';
import { ClassSchedulesService } from './class-schedules.service';
import { ClassSchedulesController } from './class-schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTypesModule } from 'src/class-types/class-types.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ScheduleConfigurationEntity } from './entities/schedule-configuration.entity';
import { BookingEntity } from './entities/booking.entity';
import { ClassScheduleEntity } from './entities/class-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleConfigurationEntity,
      ClassScheduleEntity,
      BookingEntity,
    ]),
    ClassTypesModule,
    RoomsModule,
  ],
  controllers: [ClassSchedulesController],
  providers: [ClassSchedulesService],
  exports: [ClassSchedulesService],
})
export class ClassSchedulesModule {}
