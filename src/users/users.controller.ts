import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/auth/constants/role.constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ASSISTANT)
  async create(
    @GetUser() authUser: ActiveUser,
    @Body() userData: CreateUserDto,
  ) {
    return await this.usersService.create(authUser, userData);
  }

  @Get(':email')
  async findOne(
    @GetUser() authUser: ActiveUser,
    @Param('email') email: string,
  ) {
    const user = await this.usersService.findOneByEmail(authUser, email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  @Roles(UserRole.ASSISTANT)
  @Get()
  async findAll(@GetUser() authUser: ActiveUser) {
    return await this.usersService.findAll(authUser);
  }

  @Roles(UserRole.ASSISTANT)
  @Patch(':id')
  async update(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() userData: UpdateUserDto,
  ) {
    return await this.usersService.update(authUser, id, userData);
  }

  @Roles(UserRole.ASSISTANT)
  @Delete(':id')
  async delete(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.usersService.remove(authUser, id);
  }

  @Roles(UserRole.ASSISTANT)
  @Patch(':id/deactivate')
  async deactivate(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.usersService.deactivate(authUser, id);
  }
}
