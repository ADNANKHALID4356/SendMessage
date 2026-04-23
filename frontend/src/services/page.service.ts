import api from '@/lib/api-client';
import { shouldUseTenantScopedApi } from '@/lib/tenant-api-paths';

// ===========================================
// Types
// ===========================================

export interface Page {
  id: string;
  workspaceId: string;
  facebookAccountId: string;
  pageId: string;
  pageName: string;
  pageAccessToken?: string;
  category?: string;
  picture?: string;
  welcomeMessage?: string;
  awayMessage?: string;
  isActive: boolean;
  isWebhookActive: boolean;
  createdAt: string;
  updatedAt: string;
  facebookAccount?: {
    id: string;
    name: string;
    email?: string;
    facebookUserId: string;
  };
  workspace?: {
    id: string;
    name: string;
  };
  _count?: {
    conversations: number;
  };
}

export interface PageStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  totalContacts: number;
  averageResponseTime?: number;
}

export interface UpdatePageRequest {
  welcomeMessage?: string;
  awayMessage?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface TokenValidation {
  valid: boolean;
  expiresAt?: number;
  scopes?: string[];
}

export interface WebhookStatus {
  fixed: boolean;
  status: boolean;
}

// ===========================================
// Page Service
// ===========================================

export const pageService = {
  async getPages(workspaceId: string): Promise<Page[]> {
    if (shouldUseTenantScopedApi()) {
      return api.get<Page[]>('/tenant/pages');
    }
    return api.get<Page[]>(`/workspaces/${workspaceId}/pages`);
  },

  async getPage(workspaceId: string, pageId: string): Promise<Page> {
    if (shouldUseTenantScopedApi()) {
      return api.get<Page>(`/tenant/pages/${pageId}`);
    }
    return api.get<Page>(`/workspaces/${workspaceId}/pages/${pageId}`);
  },

  async getStats(workspaceId: string, pageId: string): Promise<PageStats> {
    if (shouldUseTenantScopedApi()) {
      return api.get<PageStats>(`/tenant/pages/${pageId}/stats`);
    }
    return api.get<PageStats>(`/workspaces/${workspaceId}/pages/${pageId}/stats`);
  },

  async updatePage(workspaceId: string, pageId: string, data: UpdatePageRequest): Promise<Page> {
    if (shouldUseTenantScopedApi()) {
      return api.put<Page>(`/tenant/pages/${pageId}`, data);
    }
    return api.put<Page>(`/workspaces/${workspaceId}/pages/${pageId}`, data);
  },

  async deactivatePage(workspaceId: string, pageId: string): Promise<void> {
    if (shouldUseTenantScopedApi()) {
      return api.delete(`/tenant/pages/${pageId}`);
    }
    return api.delete(`/workspaces/${workspaceId}/pages/${pageId}`);
  },

  async reactivatePage(workspaceId: string, pageId: string): Promise<Page> {
    if (shouldUseTenantScopedApi()) {
      return api.post<Page>(`/tenant/pages/${pageId}/reactivate`);
    }
    return api.post<Page>(`/workspaces/${workspaceId}/pages/${pageId}/reactivate`);
  },

  async syncPage(workspaceId: string, pageId: string): Promise<Page> {
    if (shouldUseTenantScopedApi()) {
      return api.post<Page>(`/tenant/pages/${pageId}/sync`);
    }
    return api.post<Page>(`/workspaces/${workspaceId}/pages/${pageId}/sync`);
  },

  async validateToken(workspaceId: string, pageId: string): Promise<TokenValidation> {
    if (shouldUseTenantScopedApi()) {
      return api.get<TokenValidation>(`/tenant/pages/${pageId}/token/validate`);
    }
    return api.get<TokenValidation>(`/workspaces/${workspaceId}/pages/${pageId}/token/validate`);
  },

  async fixWebhook(workspaceId: string, pageId: string): Promise<WebhookStatus> {
    if (shouldUseTenantScopedApi()) {
      return api.post<WebhookStatus>(`/tenant/pages/${pageId}/webhook/fix`);
    }
    return api.post<WebhookStatus>(`/workspaces/${workspaceId}/pages/${pageId}/webhook/fix`);
  },
};

export default pageService;
