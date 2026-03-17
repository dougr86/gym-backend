import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrganizationEntity, OrgStatus } from './entities/organization.entity';
import { UserEntity, UserStatus } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/auth/constants/role.constants';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly repo: Repository<OrganizationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrgDto: CreateOrganizationDto, authUser?: ActiveUser) {
    const { owner, ...orgData } = createOrgDto;

    // Determine the actor for the audit trail
    const actorId = authUser?.userId || 'SELF_SIGNUP';

    const existing = await this.repo.findOne({
      where: { name: orgData.name },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException('Organization name already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const org = queryRunner.manager.create(OrganizationEntity, {
        ...orgData,
        createdBy: actorId,
        updatedBy: actorId,
      });
      const savedOrg = await queryRunner.manager.save(org);

      const existingUser = await queryRunner.manager.findOne(UserEntity, {
        where: { email: owner.email },
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      const ownerAddress = owner.useOrgAddress
        ? {
            countryCode: savedOrg.countryCode,
            addressLine1: savedOrg.addressLine1,
            addressLine2: savedOrg.addressLine2,
            city: savedOrg.city,
            stateProvince: savedOrg.stateProvince,
            postalCode: savedOrg.postalCode,
          }
        : {};

      const hashedPassword = await bcrypt.hash(owner.password, 10);
      const newUser = queryRunner.manager.create(UserEntity, {
        ...owner,
        ...ownerAddress,
        password: hashedPassword,
        role: UserRole.OWNER,
        organization: savedOrg,
        createdBy: actorId,
        updatedBy: actorId,
      });

      await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();

      return savedOrg;
    } catch (err) {
      // If anything fails, rollback BOTH
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the connection
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: string) {
    const org = await this.repo.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return org;
  }

  async update(
    authUser: ActiveUser,
    id: string,
    updateOrgDto: UpdateOrganizationDto,
  ) {
    const org = await this.findOne(id);
    const updated = this.repo.merge(org, {
      ...updateOrgDto,
      updatedBy: authUser.userId,
    });
    return await this.repo.save(updated);
  }

  async deactivate(authUser: ActiveUser, id: string) {
    const org = await this.repo.findOne({
      where: { id },
    });

    if (!org) throw new NotFoundException();

    org.status = OrgStatus.INACTIVE;
    org.updatedBy = authUser.userId;
    return await this.repo.save(org);
  }

  async remove(authUser: ActiveUser, id: string) {
    const org = await this.findOne(id);

    org.deletedBy = authUser.userId;

    // This sets deleted_at.
    // It won't appear in future .find() calls unless { withDeleted: true } is used.
    return await this.repo.softRemove(org);
  }

  async transferOwnership(
    authUser: ActiveUser,
    orgId: string,
    dto: TransferOwnershipDto,
  ) {
    const { newOwnerId, newRoleForOldOwner, shouldDeactivate } = dto;

    if (authUser.userId === newOwnerId) {
      throw new BadRequestException(
        'You cannot transfer ownership to yourself.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // We search for a user in this org who currently has the OWNER role
      const oldOwner = await queryRunner.manager.findOne(UserEntity, {
        where: {
          organization: { id: orgId },
          role: UserRole.OWNER,
        },
      });

      if (!oldOwner) {
        throw new NotFoundException(
          'Current owner for this organization not found.',
        );
      }

      // Getting New Owner (Must be in the same Org)
      const newOwner = await queryRunner.manager.findOne(UserEntity, {
        where: { id: newOwnerId },
        relations: ['organization'],
      });

      if (!newOwner) {
        throw new NotFoundException(
          `User with ID ${newOwnerId} does not exist.`,
        );
      }

      if (newOwner.organization?.id !== orgId) {
        throw new BadRequestException(
          'The new owner must be a member of this organization.',
        );
      }

      // Promote the New Owner
      newOwner.role = UserRole.OWNER;
      newOwner.status = UserStatus.ACTIVE;
      newOwner.updatedBy = authUser.userId;

      // Demote the Current Owner
      // Set the new role (default to ADMIN)
      oldOwner.role = newRoleForOldOwner || UserRole.ADMIN;
      oldOwner.updatedBy = authUser.userId;

      // If deactivation is requested, flip the status
      if (shouldDeactivate) {
        oldOwner.status = UserStatus.INACTIVE;
      }

      await queryRunner.manager.save([newOwner, oldOwner]);

      await queryRunner.commitTransaction();

      return {
        message: shouldDeactivate
          ? 'Ownership transferred and your account deactivated.'
          : `Ownership transferred. Your new role is ${oldOwner.role}.`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
