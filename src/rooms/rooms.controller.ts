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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/constants/role.constants';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('rooms')
@UseGuards(RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.ASSISTANT)
  create(
    @GetUser() authUser: ActiveUser,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomsService.create(authUser, createRoomDto);
  }

  @Get()
  findAll(@GetUser() authUser: ActiveUser) {
    return this.roomsService.findAll(authUser);
  }

  @Get(':id')
  findOne(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.roomsService.findOne(authUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ASSISTANT)
  update(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(authUser, id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.roomsService.remove(authUser, id);
  }
}
