import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, MoreThan, Repository } from 'typeorm';
import { UserEntity, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UserRole } from 'src/auth/constants/role.constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-pass.dto';
import { OnboardUserDto } from './dto/onboard-user.dto';
import { MailService } from 'src/mail/mail.service';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private mailService: MailService,
  ) {}

  // Used by Admin/Assistant to register a new member
  async create(authUser: ActiveUser, userData: CreateUserDto) {
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    if (!userData.organizationId) {
      throw new BadRequestException('Organization is required');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const email = userData.email.toLowerCase();

    const user = this.usersRepository.create({
      ...userData,
      email,
      password: hashedPassword,
      mustChangePassword: true,
      organizationId: userData.organizationId,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
    });

    return await this.usersRepository.save(user);
  }

  async inviteUser(authUser: ActiveUser, userData: InviteUserDto) {
    // Password is required in the entity, so we create a ghost one
    const ghostPassword = this.generateRandomString(16);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(ghostPassword, salt);

    const token = this.generateRandomString(32);

    const user = this.usersRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      status: UserStatus.PENDING,
      invitationToken: token,
      invitationExpiresAt: this.getExpiryDate(20), // 20 mins
      mustChangePassword: true,
      organizationId: authUser.organizationId,
      createdBy: authUser.userId,
    });

    const savedUser = await this.usersRepository.save(user);

    await this.mailService.sendInvitation(
      savedUser.email,
      token,
      'Your Gym App', // Replace with authUser.organization.name if loaded
    );

    return savedUser;
  }

  async completeOnboarding(dto: OnboardUserDto) {
    // Find the pending user with a valid (non-expired) token
    const user = await this.usersRepository.findOne({
      where: {
        invitationToken: dto.invitationToken,
        invitationExpiresAt: MoreThan(new Date()),
        status: UserStatus.PENDING,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    Object.assign(user, {
      ...dto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      invitationToken: null,
      invitationExpiresAt: null,
      mustChangePassword: false,
      updatedBy: user.id,
    });

    return await this.usersRepository.save(user);
  }

  async findOne(authUser: ActiveUser, id: string) {
    const queryOptions: FindOneOptions<UserEntity> = {
      where: { id },
      relations: ['organization'],
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
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

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

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async resendInvitation(authUser: ActiveUser, userId: string) {
    const user = await this.findOne(authUser, userId);

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException(
        'User is already active or not in pending state',
      );
    }

    const newToken = this.generateRandomString(32);

    await this.usersRepository.update(userId, {
      status: UserStatus.PENDING,
      invitationToken: newToken,
      invitationExpiresAt: this.getExpiryDate(20),
      updatedBy: authUser.userId,
    });

    await this.mailService.sendInvitation(
      user.email,
      newToken,
      'Your Gym App', // Ideally authUser.organization.name
    );

    return { message: 'Invitation resent successfully' };
  }

  async changePassword(
    authUser: ActiveUser,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: authUser.userId },
      select: ['id', 'password', 'mustChangePassword'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      mustChangePassword: false,
      updatedBy: authUser.userId,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    // If user doesn't exist, don't tell the caller.
    // Just return success to prevent email enumeration.
    if (!user) return;

    const token = this.generateRandomString(32);
    await this.usersRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpiresAt: this.getExpiryDate(20),
    });

    await this.mailService.sendForgotPassword(user.email, token);
  }

  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: MoreThan(new Date()), // Ensure token isn't expired
      },
      select: ['id'],
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      mustChangePassword: false,
    });
  }

  async adminResetPassword(authUser: ActiveUser, userId: string) {
    const user = await this.findOne(authUser, userId);
    const tempPassword = this.generateTempPassword();
    const salt = await bcrypt.genSalt();

    await this.usersRepository.update(user.id, {
      password: await bcrypt.hash(tempPassword, salt),
      mustChangePassword: true,
      updatedBy: authUser.userId,
    });

    await this.mailService.sendAdminResetPassword(user.email, tempPassword);

    return {
      message: 'Password reset successful. An email has been sent to the user.',
    };
  }

  private generateRandomString(length: number = 12): string {
    return (
      Math.random().toString(36).slice(-length) +
      Math.random().toString(36).toUpperCase().slice(-length)
    );
  }

  private generateTempPassword(): string {
    // Generates a string like "aq9z-Xp21-mN8v"
    const pattern = 'xxxx-xxxx-xxxx';
    return pattern.replace(/[x]/g, () => {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }

  private getExpiryDate(minutes: number): Date {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + minutes);
    return expiryDate;
  }
}
