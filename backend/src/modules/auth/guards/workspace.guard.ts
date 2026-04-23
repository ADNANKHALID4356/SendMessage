import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { PermissionLevel } from '@messagesender/shared';
import { resolveTenantWorkspaceId } from '../../../common/tenant/resolve-tenant-workspace-id';

const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  [PermissionLevel.VIEW_ONLY]: 1,
  [PermissionLevel.OPERATOR]: 2,
  [PermissionLevel.MANAGER]: 3,
};

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin has full access — still attach workspace context when present (params/header/host)
    if (user?.isAdmin) {
      const wid = resolveTenantWorkspaceId(request, { isAdmin: true });
      if (wid) {
        if (request.tenantId) {
          const inTenant = await this.prisma.workspace.findFirst({
            where: { id: wid, tenantId: request.tenantId },
            select: { id: true },
          });
          if (!inTenant) {
            throw new ForbiddenException('Workspace does not belong to tenant');
          }
        }
        request.tenantWorkspaceId = wid;
      }
      return true;
    }

    const workspaceId = resolveTenantWorkspaceId(request, {
      isAdmin: false,
      requirePresent: true,
    })!;

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

    // Get required permission level
    const requiredPermission = this.reflector.get<PermissionLevel>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // Check user's access to workspace
    const access = await this.prisma.workspaceUserAccess.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.userId,
        },
      },
    });

    if (!access) {
      throw new ForbiddenException('No access to this workspace');
    }

    // Attach workspace access to request for later use
    request.workspaceAccess = access;

    // If no specific permission required, just check access exists
    if (!requiredPermission) {
      return true;
    }

    // Check permission level
    const userLevel = PERMISSION_HIERARCHY[access.permissionLevel as PermissionLevel];
    const requiredLevel = PERMISSION_HIERARCHY[requiredPermission];

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
