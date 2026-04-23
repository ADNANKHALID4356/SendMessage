import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type TenantPlanCode = 'BASIC' | 'STANDARD' | 'GROWTH' | 'PRO' | 'BUSINESS';

export type TenantPlanLimits = {
  maxMemberUsers: number; // excludes tenant admin accounts
  maxWorkspaces: number;
};

const PLAN_LIMITS: Record<TenantPlanCode, TenantPlanLimits> = {
  BASIC: { maxMemberUsers: 1, maxWorkspaces: 2 },
  STANDARD: { maxMemberUsers: 3, maxWorkspaces: 4 },
  GROWTH: { maxMemberUsers: 5, maxWorkspaces: 6 },
  PRO: { maxMemberUsers: 7, maxWorkspaces: 8 },
  BUSINESS: { maxMemberUsers: 10, maxWorkspaces: 11 },
};

@Injectable()
export class TenantPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantPlan(tenantId: string): Promise<{ planCode: TenantPlanCode; limits: TenantPlanLimits }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, status: true, planCode: true },
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new ForbiddenException('Tenant is not active');
    }

    const planCode = tenant.planCode as TenantPlanCode;
    const limits = PLAN_LIMITS[planCode] ?? PLAN_LIMITS.BASIC;
    return { planCode, limits };
  }

  async assertCanCreateMemberUser(tenantId: string): Promise<void> {
    const { limits } = await this.getTenantPlan(tenantId);

    const used = await this.prisma.user.count({
      where: {
        tenantId,
        systemRole: 'TENANT_USER',
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (used >= limits.maxMemberUsers) {
      throw new ForbiddenException(
        `Plan limit reached: maximum ${limits.maxMemberUsers} users allowed for this plan.`,
      );
    }
  }

  async assertCanCreateWorkspace(tenantId: string): Promise<void> {
    const { limits } = await this.getTenantPlan(tenantId);

    const used = await this.prisma.workspace.count({
      where: { tenantId },
    });

    if (used >= limits.maxWorkspaces) {
      throw new ForbiddenException(
        `Plan limit reached: maximum ${limits.maxWorkspaces} workspaces allowed for this plan.`,
      );
    }
  }
}

