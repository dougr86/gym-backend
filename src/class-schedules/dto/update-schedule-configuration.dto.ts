import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleConfigurationDto } from './create-schedule-configuration.dto';

export class UpdateScheduleConfigurationDto extends PartialType(
  CreateScheduleConfigurationDto,
) {}
