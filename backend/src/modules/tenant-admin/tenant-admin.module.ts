import { Module } from '@nestjs/common';
import { TenantAdminController } from './tenant-admin.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, WorkspacesModule],
  controllers: [TenantAdminController],
})
export class TenantAdminModule {}

