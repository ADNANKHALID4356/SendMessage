import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantAdminGuard } from '../auth/guards/tenant-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateWorkspaceDto } from '../workspaces/dto';
import { TenantPlanService } from '../../common/tenant/tenant-plan.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Tenant Admin')
@ApiBearerAuth()
@Controller('tenant-admin')
@UseGuards(JwtAuthGuard, TenantAdminGuard)
export class TenantAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly tenantPlanService: TenantPlanService,
  ) {}

  @Get('plan')
  @ApiOperation({ summary: 'Get current plan, limits, and usage for tenant' })
  async getPlan(@CurrentUser() user: { tenantId: string }) {
    const tenantId = user.tenantId;
    const { planCode, limits } = await this.tenantPlanService.getTenantPlan(tenantId);

    const [memberUsersUsed, workspacesUsed] = await Promise.all([
      this.prisma.user.count({
        where: {
          tenantId,
          systemRole: 'TENANT_USER',
          status: { in: ['PENDING', 'ACTIVE'] },
        },
      }),
      this.prisma.workspace.count({ where: { tenantId } }),
    ]);

    return {
      tenantId,
      planCode,
      limits,
      usage: {
        memberUsers: memberUsersUsed,
        workspaces: workspacesUsed,
      },
    };
  }

  @Post('workspaces')
  @ApiOperation({ summary: 'Create a workspace under this tenant (plan-limited)' })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser() user: { tenantId: string },
  ) {
    return this.workspacesService.create(dto, user.tenantId);
  }
}

