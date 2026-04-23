import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  sessionId: string;
  impersonatorAdminId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.authService.validateSession(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    if (
      payload.impersonatorAdminId &&
      payload.impersonatorAdminId !== session.impersonatorAdminId
    ) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Return a consistent user object:
    // - `id` and `userId` both point to the user/admin ID (for @CurrentUser compatibility)
    // - `role` derived from isAdmin flag for RolesGuard compatibility
    // - Admin users get SUPER_ADMIN role (highest privilege)
    if (payload.isAdmin) {
      return {
        id: payload.sub,
        userId: payload.sub,
        isAdmin: payload.isAdmin,
        role: 'SUPER_ADMIN',
        sessionId: payload.sessionId,
        impersonatorAdminId: session.impersonatorAdminId,
      };
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, tenantId: true, systemRole: true, status: true },
    });

    return {
      id: payload.sub,
      userId: payload.sub,
      isAdmin: payload.isAdmin,
      role: 'USER',
      sessionId: payload.sessionId,
      impersonatorAdminId: session.impersonatorAdminId,
      tenantId: dbUser?.tenantId ?? null,
      systemRole: dbUser?.systemRole ?? 'TENANT_USER',
      status: dbUser?.status ?? null,
    };
  }
}
