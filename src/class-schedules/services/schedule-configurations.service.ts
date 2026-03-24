import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleConfigurationDto } from '../dto/create-schedule-configuration.dto';
import { UpdateScheduleConfigurationDto } from '../dto/update-schedule-configuration.dto';
import { ScheduleConfigurationEntity } from '../entities/schedule-configuration.entity';
import { ClassSchedulesService } from './class-schedules.service';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';

@Injectable()
export class ScheduleConfigurationsService {
  constructor(
    @InjectRepository(ScheduleConfigurationEntity)
    private readonly configRepo: Repository<ScheduleConfigurationEntity>,
    private readonly classSchedulesService: ClassSchedulesService,
  ) {}

  async create(authUser: ActiveUser, dto: CreateScheduleConfigurationDto) {
    const config = this.configRepo.create({
      ...dto,
      organizationId: authUser.organizationId,
    });
    const savedConfig = await this.configRepo.save(config);

    await this.classSchedulesService.generateInstancesFromConfig(savedConfig);
    return savedConfig;
  }

  async findAll(authUser: ActiveUser) {
    return await this.configRepo.find({
      where: {
        organizationId: authUser.organizationId,
        isActive: true,
      },
      relations: ['classType', 'room', 'instructor'],
    });
  }

  async findOne(authUser: ActiveUser, id: string) {
    const config = await this.configRepo.findOne({
      where: { id, organizationId: authUser.organizationId },
      relations: ['classType', 'room', 'instructor'],
    });

    if (!config) {
      throw new NotFoundException(`Schedule configuration not found`);
    }
    return config;
  }

  async update(
    authUser: ActiveUser,
    id: string,
    dto: UpdateScheduleConfigurationDto,
  ) {
    const config = await this.findOne(authUser, id);
    Object.assign(config, dto);
    return await this.configRepo.save(config);
  }

  async remove(authUser: ActiveUser, id: string) {
    const config = await this.findOne(authUser, id);

    // Cleanup future rows in the other service
    await this.classSchedulesService.cleanupFutureInstances(id);

    return await this.configRepo.softRemove(config);
  }
}
