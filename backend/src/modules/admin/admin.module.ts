import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemHealthService } from './system-health.service';
import { ReportService } from './report.service';
import { BackupService } from './backup.service';
import { EmailService } from './email.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AuthModule } from '../auth/auth.module';
import { TenantPlanService } from '../../common/tenant/tenant-plan.service';

@Module({
  imports: [PrismaModule, RedisModule, WorkspacesModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, SystemHealthService, ReportService, BackupService, EmailService, TenantPlanService],
  exports: [AdminService, SystemHealthService, ReportService, BackupService, EmailService],
})
export class AdminModule {}
