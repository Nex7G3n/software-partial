import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permission.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { rolePermissions } from '../configs/role-permissions.config';
import { User } from '../../common/types/user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    const userPermissions = user.roles.reduce((acc, role) => {
      const permissionsForRole = rolePermissions[role] || [];
      return [...new Set([...acc, ...permissionsForRole])];
    }, [] as Permission[]);

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
