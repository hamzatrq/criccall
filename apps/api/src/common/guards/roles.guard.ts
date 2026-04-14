import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Role hierarchy: super_admin > sponsor > user
 * super_admin inherits sponsor and user roles.
 * sponsor inherits user role.
 */
const ROLE_HIERARCHY: Record<string, string[]> = {
  super_admin: ['super_admin', 'sponsor', 'user'],
  sponsor: ['sponsor', 'user'],
  user: ['user'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator — allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    // Get all roles this user effectively has via hierarchy
    const effectiveRoles = ROLE_HIERARCHY[user.role] ?? [user.role];

    // Check if any of the user's effective roles matches a required role
    return requiredRoles.some((role) => effectiveRoles.includes(role));
  }
}
