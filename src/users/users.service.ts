import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UserEntity, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UserRole } from 'src/auth/constants/role.constants';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  // Used by Admin/Assistant to register a new member
  async create(authUser: ActiveUser, userData: CreateUserDto) {
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const email = userData.email.toLowerCase();

    const user = this.usersRepository.create({
      ...userData,
      email,
      password: hashedPassword,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
    });

    user.organizationId =
      authUser.role === UserRole.SUPER_ADMIN && userData.organizationId
        ? userData.organizationId
        : authUser.organizationId;

    return await this.usersRepository.save(user);
  }

  async findOne(authUser: ActiveUser, id: string) {
    const queryOptions: FindOneOptions<UserEntity> = {
      where: { id },
      relations: ['organization'],
      select: ['id', 'email', 'role'],
    };

    if (authUser.role !== UserRole.SUPER_ADMIN) {
      queryOptions.where = {
        id,
        organization: { id: authUser.organizationId },
      };
    }

    const user = await this.usersRepository.findOne(queryOptions);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOneByEmailInternal(email: string) {
    const queryOptions: FindOneOptions<UserEntity> = {
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
    const queryOptions: FindOneOptions<UserEntity> = {
      where: { email },
      relations: ['organization'],
      select: ['id', 'email', 'role'],
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
      user.organizationId = authUser.organizationId;
    }

    return await this.usersRepository.save(user);
  }

  async remove(authUser: ActiveUser, id: string) {
    const user = await this.findOne(authUser, id);

    // Track who did it
    user.deletedBy = authUser.userId;

    return await this.usersRepository.softRemove(user);
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
    user.updatedBy = authUser.userId;
    return await this.usersRepository.save(user);
  }
}
