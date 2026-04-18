import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard, Role } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): Partial<ExecutionContext> => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () =>
      ({
        getRequest: () => ({ user }),
        getResponse: jest.fn() as any,
        getNext: jest.fn() as any,
      }) as any,
  });

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext({ id: '1' });
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return true if user is admin (SUPER_ADMIN bypass)', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ isAdmin: true });
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return true if required roles are purely workspace roles (defers to WorkspaceGuard)', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);
    // Standard user without global role
    const context = createMockContext({ isAdmin: false, role: 'USER' });
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return false if standard user tries to access ADMIN route', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext({ isAdmin: false, role: 'USER' });
    expect(guard.canActivate(context as ExecutionContext)).toBe(false);
  });

  it('should return false if no user exists', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createMockContext(undefined);
    expect(guard.canActivate(context as ExecutionContext)).toBe(false);
  });
});
