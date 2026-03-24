import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, MoreThanOrEqual } from 'typeorm';
import { addDays, startOfDay } from 'date-fns';
import { ScheduleConfigurationEntity } from '../entities/schedule-configuration.entity';
import { ClassSchedulesService } from './class-schedules.service';

@Injectable()
export class ScheduleCronService {
  private readonly logger = new Logger(ScheduleCronService.name);

  constructor(
    @InjectRepository(ScheduleConfigurationEntity)
    private readonly configRepo: Repository<ScheduleConfigurationEntity>,
    private readonly schedulesService: ClassSchedulesService,
  ) {}

  /**
   * Runs every day at Midnight
   * Checks all active rules and ensures a class exists for "Today + 30 Days"
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRollingWindow() {
    this.logger.log('Starting daily schedule maintenance...');

    const targetDate = addDays(startOfDay(new Date()), 30);
    const dayToGenerate = targetDate.getDay();

    // 1. Find all active configurations that should run on this day of the week
    // and where the targetDate is still within the config's validity period
    const activeConfigs = await this.configRepo.find({
      where: [
        // Case 1: Active, started, and has NO end date (infinite)
        {
          isActive: true,
          startDate: LessThanOrEqual(targetDate),
          endDate: IsNull(),
        },
        // Case 2: Active, started, and we haven't reached the end date yet
        {
          isActive: true,
          startDate: LessThanOrEqual(targetDate),
          endDate: MoreThanOrEqual(targetDate),
        },
      ],
    });

    for (const config of activeConfigs) {
      // Only process if the config includes this specific day of the week
      if (config.daysOfWeek.includes(dayToGenerate)) {
        // Final check: if config has an end date, make sure we haven't passed it
        if (config.endDate && targetDate > new Date(config.endDate)) {
          continue;
        }

        try {
          // We call a specific method in the Factory to create just ONE day
          await this.schedulesService.generateSingleDay(config, targetDate);
        } catch (error) {
          if (error instanceof Error) {
            this.logger.error(
              `Failed to generate day for config ${config.id}: ${error.message}`,
              error.stack,
            );
          } else {
            this.logger.error(
              `An unknown error occurred while generating schedule for config ${config.id}`,
            );
          }
        }
      }
    }

    this.logger.log('Daily schedule maintenance complete.');
  }
}
