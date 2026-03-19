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
import { ClassTypesService } from './class-types.service';
import { CreateClassTypeDto } from './dto/create-class-type.dto';
import { UpdateClassTypeDto } from './dto/update-class-type.dto';
import { UserRole } from 'src/auth/constants/role.constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('class-types')
@UseGuards(RolesGuard)
export class ClassTypesController {
  constructor(private readonly classTypesService: ClassTypesService) {}

  @Post()
  @Roles(UserRole.ASSISTANT) // Assistants+ can manage the "Menu"
  create(
    @GetUser() authUser: ActiveUser,
    @Body() createClassTypeDto: CreateClassTypeDto,
  ) {
    return this.classTypesService.create(authUser, createClassTypeDto);
  }

  @Get()
  @Roles(UserRole.INSTRUCTOR) // Instructors and above can view the menu
  findAll(@GetUser() authUser: ActiveUser) {
    return this.classTypesService.findAll(authUser);
  }

  @Get(':id')
  @Roles(UserRole.INSTRUCTOR)
  findOne(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classTypesService.findOne(authUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ASSISTANT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassTypeDto: UpdateClassTypeDto,
    @GetUser() authUser: ActiveUser,
  ) {
    return this.classTypesService.update(authUser, id, updateClassTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() authUser: ActiveUser,
  ) {
    return this.classTypesService.remove(authUser, id);
  }
}
