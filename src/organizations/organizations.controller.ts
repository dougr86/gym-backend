import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserRole } from 'src/auth/constants/role.constants';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import type { ActiveUser } from 'src/auth/interfaces/active-user.interface';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(
    @GetUser() authUser: ActiveUser,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(createOrganizationDto, authUser);
  }

  @Post('signup')
  // Will be public one we have the subscription feature
  @Roles(UserRole.SUPER_ADMIN)
  //@Public()
  selfSignup(@Body() createOrganizationDto: CreateOrganizationDto) {
    // Pass undefined for authUser -> Service will use 'SELF_SIGNUP'
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.findOne(authUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  update(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(
      authUser,
      id,
      updateOrganizationDto,
    );
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  deactivate(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.deactivate(authUser, id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.remove(authUser, id);
  }

  @Patch(':id/transfer-ownership')
  @Roles(UserRole.OWNER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async transfer(
    @GetUser() authUser: ActiveUser,
    @Param('id', ParseUUIDPipe) orgId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return await this.organizationsService.transferOwnership(
      authUser,
      orgId,
      dto,
    );
  }
}
