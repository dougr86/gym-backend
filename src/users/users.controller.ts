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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/auth/constants/role.constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-pass.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('manual-create')
  @Roles(UserRole.SUPER_ADMIN)
  async create(
    @GetUser() authUser: ActiveUser,
    @Body() userData: CreateUserDto,
  ) {
    return await this.usersService.create(authUser, userData);
  }

  @Post('invite')
  @Roles(UserRole.ASSISTANT)
  async invite(
    @GetUser() authUser: ActiveUser,
    @Body() userData: InviteUserDto,
  ) {
    return await this.usersService.inviteUser(authUser, userData);
  }

  @Public()
  @Post('onboard')
  async onboard(@Body() dto: OnboardUserDto) {
    await this.usersService.completeOnboarding(dto);
    return { message: 'Account activated successfully. You can now log in.' };
  }

  @Patch('change-password')
  async changePassword(
    @GetUser() authUser: ActiveUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(authUser, dto);
    return { message: 'Password updated successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.usersService.forgotPassword(email);
    return; // Returns 200/201 No Content
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.usersService.resetPasswordWithToken(token, password);
    return { message: 'Password has been reset' };
  }

  @Get('/emails/:email')
  @Roles(UserRole.ASSISTANT)
  async findOneByEmail(
    @GetUser() authUser: ActiveUser,
    @Param('email') email: string,
  ) {
    const user = await this.usersService.findOneByEmail(authUser, email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  @Get(':id')
  @Roles(UserRole.INSTRUCTOR)
  async findOne(@GetUser() authUser: ActiveUser, @Param('id') id: string) {
    return await this.usersService.findOne(authUser, id);
  }

  @Get()
  @Roles(UserRole.ASSISTANT)
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

  @Roles(UserRole.ADMIN)
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

  @Post(':id/resend-invitation')
  @Roles(UserRole.ASSISTANT)
  async resend(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.usersService.resendInvitation(authUser, id);
  }

  @Patch(':id/admin-reset-password')
  @Roles(UserRole.ASSISTANT)
  async adminResetPassword(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.usersService.adminResetPassword(authUser, id);
  }
}
