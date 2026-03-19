import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClassSchedulesService } from './class-schedules.service';
import { CreateScheduleConfigurationDto } from './dto/create-schedule-configuration.dto';
import { UpdateScheduleConfigurationDto } from './dto/update-schedule-configuration.dto';

@Controller('class-schedules')
export class ClassSchedulesController {
  constructor(private readonly classSchedulesService: ClassSchedulesService) {}

  @Post()
  create(@Body() createClassScheduleDto: CreateScheduleConfigurationDto) {
    return this.classSchedulesService.create(createClassScheduleDto);
  }

  @Get()
  findAll() {
    return this.classSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classSchedulesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClassScheduleDto: UpdateScheduleConfigurationDto,
  ) {
    return this.classSchedulesService.update(+id, updateClassScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classSchedulesService.remove(+id);
  }
}
