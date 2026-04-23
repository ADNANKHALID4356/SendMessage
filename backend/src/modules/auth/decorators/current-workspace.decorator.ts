import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get the current workspace ID from the request
 * The workspace ID should be set by middleware or from user's active workspace
 */
export const CurrentWorkspace = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Prefer resolved tenant workspace id (set by guards/middleware)
    if (request.tenantWorkspaceId) {
      return request.tenantWorkspaceId;
    }

    let workspaceId =
      request.params?.workspaceId ||
      request.headers['x-workspace-id'] ||
      request.query?.workspaceId;

    return workspaceId || '';
  },
);
