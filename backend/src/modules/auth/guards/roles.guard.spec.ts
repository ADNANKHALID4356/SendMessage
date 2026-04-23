import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard, Role } from './roles.guard';
import { PermissionLevel } from '@messagesender/shared';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    prisma = {
      workspaceUserAccess: {
        findUnique: jest.fn(),
      },
    };
    guard = new RolesGuard(reflector, prisma);
  });

  const createMockContext = (user: any, reqOverrides: any = {}): Partial<ExecutionContext> => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () =>
      ({
        getRequest: () => ({
          user,
          params: {},
          query: {},
          headers: {},
          ...reqOverrides,
        }),
        getResponse: jest.fn() as any,
        getNext: jest.fn() as any,
      }) as any,
  });

  it('should return true if no roles are required', async () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext({ id: '1' });
    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(true);
  });

  it('should return true if user is admin (SUPER_ADMIN bypass)', async () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ isAdmin: true });
    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(true);
  });

  it('should reject if workspace role is required but workspaceId is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);
    const context = createMockContext({ isAdmin: false, role: 'USER', userId: 'u1' });
    await expect(guard.canActivate(context as ExecutionContext)).rejects.toBeDefined();
  });

  it('should return true if workspace role is required and user has access', async () => {
    reflector.getAllAndOverride.mockReturnValue(['OPERATOR']);
    prisma.workspaceUserAccess.findUnique.mockResolvedValue({ permissionLevel: PermissionLevel.MANAGER });

    const context = createMockContext(
      { isAdmin: false, role: 'USER', userId: 'u1' },
      { headers: { 'x-workspace-id': 'w1' } },
    );

    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(true);
  });

  it('should return false if standard user tries to access ADMIN route', async () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ isAdmin: false, role: 'USER' });
    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(false);
  });

  it('should return false if no user exists', async () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context as ExecutionContext)).resolves.toBe(false);
  });

  it('should reject mismatched X-Workspace-Id when tenant host workspace is set', async () => {
    reflector.getAllAndOverride.mockReturnValue(['VIEW_ONLY']);
    const context = createMockContext(
      { isAdmin: false, role: 'USER', userId: 'u1' },
      { tenantWorkspaceId: 'from-host', headers: { 'x-workspace-id': 'other' } },
    );
    await expect(guard.canActivate(context as ExecutionContext)).rejects.toBeDefined();
  });
});
