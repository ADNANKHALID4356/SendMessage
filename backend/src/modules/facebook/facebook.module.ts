import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { FacebookController } from './facebook.controller';
import { TenantFacebookController } from './tenant-facebook.controller';
import { FacebookService } from './facebook.service';
import { FacebookApiService } from './facebook-api.service';
import { FacebookConfigService } from './facebook-config.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, PrismaModule, RedisModule, AuthModule],
  controllers: [FacebookController, TenantFacebookController],
  providers: [FacebookService, FacebookApiService, FacebookConfigService],
  exports: [FacebookService, FacebookApiService, FacebookConfigService],
})
export class FacebookModule {}
