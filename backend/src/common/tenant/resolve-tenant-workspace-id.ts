import { ForbiddenException } from '@nestjs/common';

/**
 * Resolves the active workspace for a request.
 * Non-admins on a tenant host must use the host-resolved workspace; a mismatched X-Workspace-Id is rejected.
 */
export function resolveTenantWorkspaceId(
  request: {
    tenantWorkspaceId?: string;
    params?: { workspaceId?: string };
    query?: { workspaceId?: string };
    body?: { workspaceId?: string };
    headers?: Record<string, string | string[] | undefined>;
  },
  options: { isAdmin: boolean; requirePresent?: boolean },
): string | undefined {
  const fromHost = request.tenantWorkspaceId;
  const fromParam = request.params?.workspaceId;
  const fromQuery = request.query?.workspaceId as string | undefined;
  const fromBody =
    request.body && typeof request.body.workspaceId === 'string'
      ? request.body.workspaceId
      : undefined;
  const headerRaw = request.headers?.['x-workspace-id'];
  const fromHeader = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw;

  if (!options.isAdmin && fromHost) {
    if (fromHeader && fromHeader !== fromHost) {
      throw new ForbiddenException('Workspace does not match tenant host');
    }
    return fromHost;
  }

  const resolved = fromHost || fromParam || fromQuery || fromBody || fromHeader;
  if (options.requirePresent && !resolved) {
    throw new ForbiddenException('Workspace ID is required');
  }
  return resolved ? String(resolved) : undefined;
}
