import { Injectable } from '@nestjs/common';
import { CreateScheduleConfigurationDto } from './dto/create-schedule-configuration.dto';
import { UpdateScheduleConfigurationDto } from './dto/update-schedule-configuration.dto';

@Injectable()
export class ClassSchedulesService {
  create(createClassScheduleDto: CreateScheduleConfigurationDto) {
    return 'This action adds a new classSchedule';
  }

  findAll() {
    return `This action returns all classSchedules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} classSchedule`;
  }

  update(id: number, updateClassScheduleDto: UpdateScheduleConfigurationDto) {
    return `This action updates a #${id} classSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} classSchedule`;
  }
}
