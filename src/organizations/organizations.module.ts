import { Module } from '@nestjs/common';
import { OrganizationsService } from './services/organizations.service';
import { OrganizationsController } from './controllers/organizations.controller';
import { OrganizationEntity } from './entities/organization.entity';
import { OrganizationSettingsEntity } from './entities/organization-settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrganizationSettingsService } from './services/organization-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      OrganizationSettingsEntity,
      UserEntity,
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationSettingsService],
  exports: [OrganizationsService, OrganizationSettingsService],
})
export class OrganizationsModule {}
