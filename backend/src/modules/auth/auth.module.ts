import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WorkspaceGuard } from './guards/workspace.guard';
import { LoginRateLimitGuard } from './guards/rate-limit.guard';
import { RedisModule } from '../../redis/redis.module';
import { TenantPlanService } from '../../common/tenant/tenant-plan.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    WorkspaceGuard,
    LoginRateLimitGuard,
    TenantPlanService,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, WorkspaceGuard, LoginRateLimitGuard, TenantPlanService],
})
export class AuthModule {}
