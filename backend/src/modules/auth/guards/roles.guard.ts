import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { PermissionLevel } from '@messagesender/shared';
import { resolveTenantWorkspaceId } from '../../../common/tenant/resolve-tenant-workspace-id';

/**
 * User roles from the Prisma schema
 * SUPER_ADMIN: Full system access (the main business owner)
 * ADMIN: Administrative access
 * MANAGER: Can manage workspaces they're assigned to
 * OPERATOR: Can handle conversations and basic operations
 * VIEW_ONLY: Read-only access
 */
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEW_ONLY' | 'USER';

// Role hierarchy for access level comparison
const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  OPERATOR: 40,
  VIEW_ONLY: 20,
  USER: 10,
};

const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  [PermissionLevel.VIEW_ONLY]: 1,
  [PermissionLevel.OPERATOR]: 2,
  [PermissionLevel.MANAGER]: 3,
};

const WORKSPACE_ROLE_TO_PERMISSION: Partial<Record<Role, PermissionLevel>> = {
  VIEW_ONLY: PermissionLevel.VIEW_ONLY,
  OPERATOR: PermissionLevel.OPERATOR,
  MANAGER: PermissionLevel.MANAGER,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Admin users (isAdmin=true from JWT) have SUPER_ADMIN level access
    // This is the primary admin of the single-owner system
    if (user.isAdmin === true) {
      const request = context.switchToHttp().getRequest();
      const workspaceId = resolveTenantWorkspaceId(request, { isAdmin: true });
      if (workspaceId) {
        if (request.tenantId) {
          const inTenant = await this.prisma.workspace.findFirst({
            where: { id: workspaceId, tenantId: request.tenantId },
            select: { id: true },
          });
          if (!inTenant) {
            throw new ForbiddenException('Workspace does not belong to tenant');
          }
        }
        request.tenantWorkspaceId = workspaceId;
      }
      return true;
    }

    // If the endpoint requires workspace-level roles, we MUST defer to the WorkspaceGuard
    // Workspace-level roles are: MANAGER, OPERATOR, VIEW_ONLY
    const workspaceRoles: Role[] = ['MANAGER', 'OPERATOR', 'VIEW_ONLY'];
    const hasWorkspaceRoleRequirement = requiredRoles.some((r) => workspaceRoles.includes(r));

    if (hasWorkspaceRoleRequirement) {
      const request = context.switchToHttp().getRequest();

      const workspaceId = resolveTenantWorkspaceId(request, {
        isAdmin: false,
        requirePresent: true,
      });

      const wid = workspaceId!;
      request.tenantWorkspaceId = wid;

      if (request.tenantId) {
        const inTenant = await this.prisma.workspace.findFirst({
          where: { id: wid, tenantId: request.tenantId },
          select: { id: true },
        });
        if (!inTenant) {
          throw new ForbiddenException('Workspace does not belong to tenant');
        }
      }

      const access = await this.prisma.workspaceUserAccess.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: wid,
            userId: user.userId,
          },
        },
      });

      if (!access) {
        throw new ForbiddenException('No access to this workspace');
      }

      request.workspaceAccess = access;

      // Enforce strongest required workspace role
      const requiredPermissionLevels = requiredRoles
        .map((r) => WORKSPACE_ROLE_TO_PERMISSION[r])
        .filter(Boolean) as PermissionLevel[];

      const requiredLevel = Math.max(
        ...requiredPermissionLevels.map((p) => PERMISSION_HIERARCHY[p]),
        0,
      );
      const userLevel = PERMISSION_HIERARCHY[access.permissionLevel as PermissionLevel] || 0;

      if (userLevel < requiredLevel) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    }

    // For global roles, check their system role
    const userRole = user.role as Role;
    if (!userRole) {
      return false;
    }

    const userLevel = ROLE_HIERARCHY[userRole] || 0;

    // Check if user's role level is >= any of the required roles
    return requiredRoles.some((requiredRole) => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
      return userLevel >= requiredLevel;
    });
  }
}
