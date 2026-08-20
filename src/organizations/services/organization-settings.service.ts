import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSettingsEntity } from '../entities/organization-settings.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { UpdateOrganizationSettingsDto } from '../dto/update-organization-settings.dto';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettingsEntity)
    private readonly settingsRepository: Repository<OrganizationSettingsEntity>,

    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  /**
   * Resolves the policy matrix for a given organization.
   * Auto-provisions defaults if the settings row is missing.
   */
  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationSettingsEntity> {
    let settings = await this.settingsRepository.findOne({
      where: { organization: { id: organizationId } },
    });

    // Safe Initialization Fail-safe: Auto-provision defaults if empty
    if (!settings) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundException(
          `Organization with ID ${organizationId} not found`,
        );
      }

      settings = this.settingsRepository.create({
        organization,
        allowAdminTaxIdEdit: false,
        sessionTimeoutMinutes: 60,
        passwordMinLength: 8,
        passwordRequireUppercase: false,
        passwordRequireNumbers: false,
        passwordRequireSpecial: false,
        passwordMaxAgeMonths: 0,
      });

      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  /**
   * Patches the compliance policy parameters.
   */
  async update(
    organizationId: string,
    dto: UpdateOrganizationSettingsDto,
  ): Promise<OrganizationSettingsEntity> {
    // Ensure the baseline settings context exists
    const settings = await this.findByOrganizationId(organizationId);

    // Merge incoming parameters into the managed entity
    Object.assign(settings, dto);

    return this.settingsRepository.save(settings);
  }
}
