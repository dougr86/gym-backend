import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
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
  update(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(authUser, id, updateLocationDto);
  }

  @Delete(':id')
  remove(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.locationsService.remove(authUser, id);
  }
}
