import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Allows access to authenticated tenant admin users only.
 *
 * - Must be a user JWT (isAdmin=false)
 * - Must have systemRole=TENANT_ADMIN
 * - Must belong to a tenant (tenantId present)
 * - If request is on a tenant host, tenantId must match the host-resolved tenantId
 */
@Injectable()
export class TenantAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as
      | {
          isAdmin?: boolean;
          tenantId?: string | null;
          systemRole?: string;
        }
      | undefined;

    if (!user || user.isAdmin) {
      throw new ForbiddenException('Tenant admin access required');
    }

    if (user.systemRole !== 'TENANT_ADMIN') {
      throw new ForbiddenException('Tenant admin access required');
    }

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant admin is not assigned to a tenant');
    }

    if (req.tenantId && req.tenantId !== user.tenantId) {
      throw new ForbiddenException('Tenant does not match host');
    }

    return true;
  }
}

