import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/auth/constants/role.constants';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrgDto: CreateOrganizationDto) {
    const { owner, ...orgData } = createOrgDto;

    const existing = await this.repo.findOne({
      where: { name: orgData.name },
    });

    if (existing) {
      throw new ConflictException('Organization name already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const org = queryRunner.manager.create(Organization, orgData);
      const savedOrg = await queryRunner.manager.save(org);

      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: owner.email },
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(owner.password, 10);
      const newUser = queryRunner.manager.create(User, {
        ...owner,
        password: hashedPassword,
        role: UserRole.OWNER,
        organization: savedOrg, // Link them here!
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

  async update(id: string, updateOrgDto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    const updated = this.repo.merge(org, updateOrgDto);
    return await this.repo.save(updated);
  }
}
