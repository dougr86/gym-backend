import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import {
  ClassScheduleEntity,
  ScheduleStatus,
} from '../entities/class-schedule.entity';
import { ScheduleConfigurationEntity } from '../entities/schedule-configuration.entity';
import { CreateClassScheduleDto } from '../dto/create-class-schedule.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import {
  addDays,
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
} from 'date-fns';
import { RoomEntity } from 'src/rooms/entities/room.entity';
import { FindAllSchedulesDto } from '../dto/find-all-schedules.dto';

@Injectable()
export class ClassSchedulesService {
  constructor(
    @InjectRepository(ClassScheduleEntity)
    private readonly scheduleRepo: Repository<ClassScheduleEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
  ) {}

  async findAll(authUser: ActiveUser, query: FindAllSchedulesDto) {
    const { start, end } = query;

    return await this.scheduleRepo.find({
      where: {
        organizationId: authUser.organizationId,
        startTime: Between(new Date(start), new Date(end)),
      },
      // We include relations so the frontend knows the Room Name and Instructor Name
      relations: ['classType', 'room', 'instructor'],
      order: {
        startTime: 'ASC',
      },
    });
  }

  /**
   * Generates the "30-day carpet" of classes for a new or updated rule.
   */
  async generateInstancesFromConfig(config: ScheduleConfigurationEntity) {
    const instances: Partial<ClassScheduleEntity>[] = [];

    const capacity = await this.resolveRoomCapacity(config);

    const today = startOfDay(new Date());
    const horizon = addDays(today, 30);
    let checkDate: Date = new Date(config.startDate);

    const stopDate =
      config.endDate && isBefore(config.endDate, horizon)
        ? new Date(config.endDate)
        : horizon;

    while (
      isBefore(checkDate, stopDate) ||
      checkDate.getTime() === stopDate.getTime()
    ) {
      if (config.daysOfWeek.includes(checkDate.getDay())) {
        instances.push({
          configId: config.id,
          classTypeId: config.classTypeId,
          roomId: config.roomId,
          instructorId: config.instructorId,
          organizationId: config.organizationId, // Inherited from config
          startTime: this.combineDateAndTime(checkDate, config.startTime),
          endTime: this.combineDateAndTime(checkDate, config.endTime),
          maxCapacity: capacity,
          status: ScheduleStatus.SCHEDULED,
          isSpecialEvent: false,
        });
      }
      checkDate = addDays(checkDate, 1);
    }

    if (instances.length > 0) {
      return await this.scheduleRepo.save(instances);
    }
  }

  async cleanupFutureInstances(configId: string) {
    const now = new Date();

    await this.scheduleRepo.delete({
      configId,
      startTime: MoreThan(now),
      currentOccupancy: 0,
    });

    await this.scheduleRepo.update(
      {
        configId,
        startTime: MoreThan(now),
        currentOccupancy: MoreThan(0),
      },
      {
        status: ScheduleStatus.CANCELLED,
        cancellationReason:
          'Recurring schedule was removed or modified by administrator.',
      },
    );
  }

  /**
   * Manual Creation (Context-aware)
   */
  async createManual(authUser: ActiveUser, dto: CreateClassScheduleDto) {
    const schedule = this.scheduleRepo.create({
      ...dto,
      organizationId: authUser.organizationId,
      configId: null,
    });
    return await this.scheduleRepo.save(schedule);
  }

  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [h, m, s] = timeStr.split(':').map(Number);
    let d = new Date(date);
    d = setHours(d, h);
    d = setMinutes(d, m);
    d = setSeconds(d, s || 0);
    return d;
  }

  async generateSingleDay(config: ScheduleConfigurationEntity, date: Date) {
    // Check if it already exists to prevent duplicates
    const exists = await this.scheduleRepo.findOne({
      where: {
        configId: config.id,
        startTime: this.combineDateAndTime(date, config.startTime),
      },
    });

    if (exists) {
      return;
    }

    const capacity = await this.resolveRoomCapacity(config);

    const instance = this.scheduleRepo.create({
      configId: config.id,
      classTypeId: config.classTypeId,
      roomId: config.roomId,
      instructorId: config.instructorId,
      organizationId: config.organizationId,
      startTime: this.combineDateAndTime(date, config.startTime),
      endTime: this.combineDateAndTime(date, config.endTime),
      maxCapacity: capacity,
      status: ScheduleStatus.SCHEDULED,
    });

    return await this.scheduleRepo.save(instance);
  }

  private async resolveRoomCapacity(
    config: ScheduleConfigurationEntity,
  ): Promise<number> {
    if (config.room && config.room.capacity) {
      return config.room.capacity;
    }

    const room = await this.roomRepo.findOne({ where: { id: config.roomId } });
    if (!room) {
      throw new BadRequestException(`Room with ID ${config.roomId} not found`);
    }

    return room.capacity;
  }
}
