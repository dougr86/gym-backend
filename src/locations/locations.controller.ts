import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/constants/role.constants';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('locations')
@UseGuards(RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  create(
    @GetUser() authUser: ActiveUser,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    return this.locationsService.create(authUser, createLocationDto);
  }

  @Get()
  findAll(@GetUser() authUser: ActiveUser) {
    return this.locationsService.findAll(authUser);
  }

  @Get(':id')
  findOne(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.findOne(authUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(authUser, id, updateLocationDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  remove(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.remove(authUser, id);
  }
}
