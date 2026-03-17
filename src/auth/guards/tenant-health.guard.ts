import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgStatus } from '../../organizations/entities/organization.entity';
import { UserEntity, UserStatus } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { ActiveUser } from '../interfaces/active-user.interface';
import { UserRole } from '../constants/role.constants';
import { SKIP_SUBSCRIPTION_KEY } from '../decorators/skip-subscription.decorator';

@Injectable()
export class TenantHealthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. If it's Public, skip everything
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Extract user from request (set by JwtAuthGuard)
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: ActiveUser }>();
    const authUser = request.user as ActiveUser;
    if (!authUser) return false;

    // 3. Super Admin bypass
    if (authUser.role === UserRole.SUPER_ADMIN) return true;

    // 4. Fetch Health Data
    const user = await this.userRepo.findOne({
      where: { id: authUser.userId },
      select: {
        id: true,
        status: true,
        organization: {
          id: true,
          status: true,
        },
      },
      relations: {
        organization: true,
      },
    });

    // 5. User MUST be active to do anything (even billing)
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is inactive');
    }

    // 6. Check for @SkipSubscription()
    const skipSub = this.reflector.getAllAndOverride<boolean>(
      SKIP_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipSub) return true; // Let them through to pay their bill!

    // 7. Final check: Organization Health
    if (!user.organization || user.organization.status !== OrgStatus.ACTIVE) {
      throw new ForbiddenException(
        `Gym access is ${user.organization?.status || 'restricted'}`,
      );
    }

    return true;
  }
}
