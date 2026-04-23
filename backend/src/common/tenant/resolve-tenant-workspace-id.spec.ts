import { ForbiddenException } from '@nestjs/common';
import { resolveTenantWorkspaceId } from './resolve-tenant-workspace-id';

describe('resolveTenantWorkspaceId', () => {
  it('prefers host tenant for non-admin and rejects conflicting header', () => {
    expect(() =>
      resolveTenantWorkspaceId(
        {
          tenantWorkspaceId: 'ws-a',
          headers: { 'x-workspace-id': 'ws-b' },
        },
        { isAdmin: false },
      ),
    ).toThrow(ForbiddenException);
  });

  it('uses host tenant for non-admin when header matches or absent', () => {
    expect(
      resolveTenantWorkspaceId(
        { tenantWorkspaceId: 'ws-a', headers: { 'x-workspace-id': 'ws-a' } },
        { isAdmin: false },
      ),
    ).toBe('ws-a');
    expect(
      resolveTenantWorkspaceId({ tenantWorkspaceId: 'ws-a', headers: {} }, { isAdmin: false }),
    ).toBe('ws-a');
  });

  it('allows admin to use header when no host tenant', () => {
    expect(
      resolveTenantWorkspaceId(
        { headers: { 'x-workspace-id': 'ws-x' }, params: {} },
        { isAdmin: true },
      ),
    ).toBe('ws-x');
  });

  it('falls back to param for legacy routes', () => {
    expect(
      resolveTenantWorkspaceId(
        { params: { workspaceId: 'legacy' } },
        { isAdmin: false },
      ),
    ).toBe('legacy');
  });

  it('falls back to JSON body workspaceId for POST routes (e.g. OAuth initiate)', () => {
    expect(
      resolveTenantWorkspaceId(
        { body: { workspaceId: 'from-body' } },
        { isAdmin: false },
      ),
    ).toBe('from-body');
  });
});
