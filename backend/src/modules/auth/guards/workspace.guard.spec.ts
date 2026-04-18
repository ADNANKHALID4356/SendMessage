import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceGuard } from './workspace.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { PermissionLevel } from '@messagesender/shared';

describe('WorkspaceGuard', () => {
  let guard: WorkspaceGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    prisma = {
      workspaceUserAccess: {
        findUnique: jest.fn(),
      },
    } as any;

    guard = new WorkspaceGuard(reflector, prisma);
  });

  const createMockContext = (user: any, requestData = {}): Partial<ExecutionContext> => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () =>
      ({
        getRequest: () => ({ user, params: {}, query: {}, headers: {}, ...requestData }),
        getResponse: jest.fn() as any,
        getNext: jest.fn() as any,
      }) as any,
  });

  it('should return true immediately if user is Admin', async () => {
    const context = createMockContext({ isAdmin: true });
    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if no workspaceId is provided', async () => {
    const context = createMockContext({ isAdmin: false, userId: 'u1' });
    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if user has no access to workspace', async () => {
    const context = createMockContext(
      { isAdmin: false, userId: 'u1' },
      { params: { workspaceId: 'w1' } },
    );
    (prisma.workspaceUserAccess.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if user is in workspace and no specific permission is required', async () => {
    const context = createMockContext(
      { isAdmin: false, userId: 'u1' },
      { params: { workspaceId: 'w1' } },
    );
    (prisma.workspaceUserAccess.findUnique as jest.Mock).mockResolvedValue({
      permissionLevel: PermissionLevel.VIEW_ONLY,
    } as any);
    reflector.get.mockReturnValue(undefined);

    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(true);
  });

  it('should restrict access if user permission is lower than required', async () => {
    const context = createMockContext(
      { isAdmin: false, userId: 'u1' },
      { headers: { 'x-workspace-id': 'w1' } },
    );
    (prisma.workspaceUserAccess.findUnique as jest.Mock).mockResolvedValue({
      permissionLevel: PermissionLevel.OPERATOR,
    } as any);
    reflector.get.mockReturnValue(PermissionLevel.MANAGER);

    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if user permission meets requirements', async () => {
    const context = createMockContext(
      { isAdmin: false, userId: 'u1' },
      { query: { workspaceId: 'w1' } },
    );

    // User is a MANAGER
    (prisma.workspaceUserAccess.findUnique as jest.Mock).mockResolvedValue({
      permissionLevel: PermissionLevel.MANAGER,
    } as any);

    // Requires OPERATOR (Level 2)
    reflector.get.mockReturnValue(PermissionLevel.OPERATOR);

    const result = await guard.canActivate(context as ExecutionContext);
    expect(result).toBe(true);
  });
});
