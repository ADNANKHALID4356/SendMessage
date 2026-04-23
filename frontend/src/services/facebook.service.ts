import api from '@/lib/api-client';
import { shouldUseTenantScopedApi } from '@/lib/tenant-api-paths';

// ===========================================
// Types
// ===========================================

export interface FacebookAccount {
  id: string;
  facebookUserId: string;
  name: string;
  email?: string;
  tokenValid: boolean;
  tokenExpiresAt: string;
}

export interface FacebookPage {
  id: string;
  pageId: string;
  name: string;
  category?: string;
  picture?: string;
  isConnected?: boolean;
  isWebhookActive?: boolean;
  /** Page access token returned by getAvailablePages – used to skip a redundant FB API call on connect */
  pageAccessToken?: string | null;
  /** False when the Facebook API didn't return an access token for this page (insufficient permissions) */
  canConnect?: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  account: FacebookAccount | null;
  pages: FacebookPage[];
}

export interface InitiateOAuthResponse {
  authUrl: string;
}

export interface ConnectPageRequest {
  facebookAccountId: string;
  pageId: string;
  pageName: string;
  /** Page access token obtained during getAvailablePages – avoids an extra Facebook API call */
  pageAccessToken?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  expiresAt: string;
}

// ===========================================
// Facebook Service
// ===========================================

export const facebookService = {
  /**
   * Initiate OAuth flow - get authorization URL
   */
  async initiateOAuth(workspaceId: string, redirectUrl?: string): Promise<InitiateOAuthResponse> {
    if (shouldUseTenantScopedApi()) {
      return api.post<InitiateOAuthResponse>('/tenant/facebook/oauth/initiate', {
        redirectUrl,
      });
    }
    return api.post<InitiateOAuthResponse>('/facebook/oauth/initiate', {
      workspaceId,
      redirectUrl,
    });
  },

  /**
   * Get Facebook connection status for a workspace
   */
  async getConnectionStatus(workspaceId: string): Promise<ConnectionStatus> {
    if (shouldUseTenantScopedApi()) {
      return api.get<ConnectionStatus>('/tenant/facebook/status');
    }
    return api.get<ConnectionStatus>(`/facebook/workspaces/${workspaceId}/status`);
  },

  /**
   * Get available pages for a connected Facebook account
   */
  async getAvailablePages(accountId: string): Promise<FacebookPage[]> {
    return api.get<FacebookPage[]>(`/facebook/accounts/${accountId}/pages`);
  },

  /**
   * Connect a Facebook page to the workspace
   */
  async connectPage(workspaceId: string, data: ConnectPageRequest): Promise<FacebookPage> {
    if (shouldUseTenantScopedApi()) {
      return api.post<FacebookPage>('/tenant/facebook/pages', data);
    }
    return api.post<FacebookPage>(`/facebook/workspaces/${workspaceId}/pages`, data);
  },

  /**
   * Disconnect a Facebook page
   */
  async disconnectPage(workspaceId: string, pageId: string): Promise<void> {
    if (shouldUseTenantScopedApi()) {
      return api.delete(`/tenant/facebook/pages/${pageId}`);
    }
    return api.delete(`/facebook/workspaces/${workspaceId}/pages/${pageId}`);
  },

  /**
   * Disconnect Facebook account from workspace
   */
  async disconnectAccount(workspaceId: string): Promise<void> {
    if (shouldUseTenantScopedApi()) {
      return api.delete('/tenant/facebook/disconnect');
    }
    return api.delete(`/facebook/workspaces/${workspaceId}/disconnect`);
  },

  /**
   * Refresh Facebook access token
   */
  async refreshToken(accountId: string): Promise<RefreshTokenResponse> {
    return api.post<RefreshTokenResponse>(`/facebook/accounts/${accountId}/refresh`);
  },

  /**
   * [DEV ONLY] Create a mock Facebook connection for testing
   */
  async createMockConnection(workspaceId: string): Promise<{
    success: boolean;
    facebookAccountId: string;
    account: FacebookAccount;
    pages: FacebookPage[];
  }> {
    if (shouldUseTenantScopedApi()) {
      return api.post('/tenant/facebook/mock/connect', {});
    }
    return api.post(`/facebook/mock/connect`, { workspaceId });
  },
};

export default facebookService;
