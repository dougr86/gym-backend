import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Put,
  Patch,
  Delete,
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
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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

  @Get()
  async findAll(@GetUser() authUser: ActiveUser) {
    return await this.usersService.findAll(authUser);
  }

  @Patch(':id')
  async update(
    @GetUser() authUser: ActiveUser,
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ) {
    return await this.usersService.update(authUser, id, userData);
  }

  @Delete(':id')
  async deactivate(@GetUser() authUser: ActiveUser, @Param('id') id: string) {
    return await this.usersService.deactivate(authUser, id);
  }
}
