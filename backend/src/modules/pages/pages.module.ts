import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FacebookModule } from '../facebook/facebook.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RedisModule } from '../../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { PagesController } from './pages.controller';
import { TenantPagesController } from './tenant-pages.controller';
import { PagesService } from './pages.service';
import { PageSyncService } from './page-sync.service';

@Module({
  imports: [PrismaModule, FacebookModule, WorkspacesModule, RedisModule, AuthModule],
  controllers: [PagesController, TenantPagesController],
  providers: [PagesService, PageSyncService],
  exports: [PagesService, PageSyncService],
})
export class PagesModule {}
