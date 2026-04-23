import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantPlanService } from '../../common/tenant/tenant-plan.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, TenantPlanService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
