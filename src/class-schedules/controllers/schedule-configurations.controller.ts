import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScheduleConfigurationsService } from '../services/schedule-configurations.service';
import {
  CreateScheduleConfigurationDto,
  UpdateScheduleConfigurationDto,
} from '../index';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/constants/role.constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator'; // Adjust path
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface'; // Adjust path

@Controller('schedule-configurations')
@UseGuards(RolesGuard)
@Roles(UserRole.ASSISTANT)
export class ScheduleConfigurationsController {
  constructor(private readonly configService: ScheduleConfigurationsService) {}

  @Post()
  create(
    @GetUser() authUser: ActiveUser,
    @Body() dto: CreateScheduleConfigurationDto,
  ) {
    return this.configService.create(authUser, dto);
  }

  @Get()
  @Roles(UserRole.INSTRUCTOR)
  findAll(@GetUser() authUser: ActiveUser) {
    return this.configService.findAll(authUser);
  }

  @Get(':id')
  @Roles(UserRole.INSTRUCTOR)
  findOne(@GetUser() authUser: ActiveUser, @Param('id') id: string) {
    return this.configService.findOne(authUser, id);
  }

  @Patch(':id')
  update(
    @GetUser() authUser: ActiveUser,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleConfigurationDto,
  ) {
    return this.configService.update(authUser, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() authUser: ActiveUser, @Param('id') id: string) {
    return this.configService.remove(authUser, id);
  }
}
