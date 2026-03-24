import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ClassSchedulesService } from '../services/class-schedules.service';
import { CreateClassScheduleDto } from '../dto/create-class-schedule.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/constants/role.constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { FindAllSchedulesDto } from '../dto/find-all-schedules.dto';

@Controller('class-schedules')
@UseGuards(RolesGuard)
export class ClassSchedulesController {
  constructor(private readonly schedulesService: ClassSchedulesService) {}

  @Get()
  findAll(
    @GetUser() authUser: ActiveUser,
    @Query() query: FindAllSchedulesDto,
  ) {
    return this.schedulesService.findAll(authUser, query);
  }

  // For the "Beach Seminar" or one-off classes
  @Post('manual')
  @Roles(UserRole.ASSISTANT)
  createManual(
    @GetUser() authUser: ActiveUser,
    @Body() dto: CreateClassScheduleDto,
  ) {
    return this.schedulesService.createManual(authUser, dto);
  }
}
