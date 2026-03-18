import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { OrgStatus } from 'src/organizations/entities/organization.entity';
import { UserStatus } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmailInternal(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('User not found or invalid data');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Your user account is deactivated.');
    }

    if (user.organization && user.organization.status !== OrgStatus.ACTIVE) {
      throw new ForbiddenException(
        `Access denied. This gym's subscription is ${user.organization.status}.`,
      );
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      org: user.organization.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        countryCode: user.countryCode,
      },
    };
  }
}
