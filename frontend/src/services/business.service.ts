import api from '@/lib/api-client';

export type TenantPlanCode = 'BASIC' | 'STANDARD' | 'GROWTH' | 'PRO' | 'BUSINESS';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface BusinessTenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  planCode: TenantPlanCode;
  createdAt: string;
}

export interface BusinessUsageResponse {
  tenant: BusinessTenant;
  limits: { maxMemberUsers: number; maxWorkspaces: number };
  usage: { memberUsers: number; workspaces: number };
}

export const businessService = {
  list: () => api.get<BusinessTenant[]>('/admin/businesses'),
  create: (body: { slug: string; name: string; planCode?: TenantPlanCode }) =>
    api.post<BusinessTenant>('/admin/businesses', body),
  update: (tenantId: string, body: { status?: TenantStatus; planCode?: TenantPlanCode }) =>
    api.patch<BusinessTenant>(`/admin/businesses/${tenantId}`, body),
  usage: (tenantId: string) => api.get<BusinessUsageResponse>(`/admin/businesses/${tenantId}/usage`),
};

