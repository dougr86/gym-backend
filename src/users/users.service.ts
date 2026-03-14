import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UserRole } from 'src/auth/constants/role.constants';
import { Organization } from 'src/organizations/entities/organization.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Used by Admin/Assistant to register a new member
  async create(authUser: ActiveUser, userData: CreateUserDto) {
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const userPayload: DeepPartial<User> = {
      ...userData,
      password: hashedPassword,
    };

    if (authUser.role !== UserRole.SUPER_ADMIN) {
      userPayload.organization = { id: authUser.organizationId };
    } else if (userData.organizationId) {
      userPayload.organization = { id: userData.organizationId };
    }

    const user = this.usersRepository.create(userPayload);
    return await this.usersRepository.save(user);
  }

  async findOne(authUser: ActiveUser, id: string) {
    const queryOptions: FindOneOptions<User> = {
      where: { id },
      relations: ['organization'],
      select: ['id', 'email', 'password', 'role'], // Add password for login comparison
    };

    if (authUser.role !== UserRole.SUPER_ADMIN) {
      queryOptions.where = {
        id,
        organization: { id: authUser.organizationId },
      };
    }

    const user = await this.usersRepository.findOne(queryOptions);

    if (!user && authUser) {
      throw new NotFoundException(`User not found in your organization`);
    }

    return user;
  }

  async findOneByEmailInternal(email: string) {
    const queryOptions: FindOneOptions<User> = {
      where: { email },
      relations: ['organization'],
      select: ['id', 'email', 'password', 'role'], // Add password for login comparison
    };

    const user = await this.usersRepository.findOne(queryOptions);

    if (!user) {
      throw new NotFoundException(
        `User with email ${email} not found in your organization`,
      );
    }

    return user;
  }

  // Find user by email for the login process later
  async findOneByEmail(authUser: ActiveUser, email: string) {
    const queryOptions: FindOneOptions<User> = {
      where: { email },
      relations: ['organization'],
      select: ['id', 'email', 'password', 'role'], // Add password for login comparison
    };

    if (authUser.role !== UserRole.SUPER_ADMIN) {
      queryOptions.where = {
        email,
        organization: { id: authUser.organizationId },
      };
    }

    const user = await this.usersRepository.findOne(queryOptions);

    if (!user && authUser) {
      throw new NotFoundException(
        `User with email ${email} not found in your organization`,
      );
    }

    return user;
  }

  async findAll(authUser: ActiveUser) {
    if (authUser.role === UserRole.SUPER_ADMIN) {
      return await this.usersRepository.find({ relations: ['organization'] });
    }

    // 2. Otherwise, strictly filter by the user's organization
    return await this.usersRepository.find({
      where: { organization: { id: authUser.organizationId } },
    });
  }

  async update(authUser: ActiveUser, id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(authUser, id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If the authUser is not a Super Admin, they cannot change roles to Super Admin
    if (
      authUser.role !== UserRole.SUPER_ADMIN &&
      updateUserDto.role === UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only Super Admins can promote others to Super Admin',
      );
    }

    // Merging the changes
    Object.assign(user, updateUserDto);

    // Hard-lock the organization again just in case the DTO tried to change it
    if (authUser.role !== UserRole.SUPER_ADMIN) {
      user.organization = { id: authUser.organizationId } as Organization;
    }

    return await this.usersRepository.save(user);
  }

  async deactivate(authUser: ActiveUser, id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!user) throw new NotFoundException();

    // Security check (Same as before)
    if (
      authUser.role !== UserRole.SUPER_ADMIN &&
      user.organization?.id !== authUser.organizationId
    ) {
      throw new ForbiddenException('Not your user to deactivate');
    }

    user.status = UserStatus.INACTIVE; // or 'inactive'
    return await this.usersRepository.save(user);
  }
}
