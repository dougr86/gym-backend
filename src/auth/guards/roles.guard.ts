import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ActiveUser } from '../interfaces/active-user.interface';
import { UserRole, RolePriority } from '../constants/role.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. What roles are required for this route?
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    // 2. Get user from request
    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user: ActiveUser }>();

    // 3. Logic: Find the highest priority required
    // If you put @Roles(UserRole.OWNER), the minWeight is 60.
    const minRequiredWeight = Math.min(
      ...requiredRoles.map((role) => RolePriority[role] ?? 0),
    );

    const userWeight = RolePriority[user?.role] ?? -1;

    // 4. Comparison
    if (userWeight < minRequiredWeight) {
      throw new ForbiddenException(
        `Insufficient permissions. Your role '${user?.role}' does not meet the minimum requirement.`,
      );
    }

    return true;
  }
}
