import api, { PaginatedResponse } from '@/lib/api-client';

// ===========================================
// Types
// ===========================================

// Aligned with backend DTOs
export type CampaignType = 'ONE_TIME' | 'SCHEDULED' | 'RECURRING' | 'DRIP';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type AudienceType = 'ALL' | 'SEGMENT' | 'PAGES' | 'MANUAL';
export type BypassMethod = 'NONE' | 'ONE_TIME_NOTIFY' | 'RECURRING_NOTIFY' | 'MESSAGE_TAG' | 'SPONSORED_MESSAGE';
export type MessageTag = 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE' | 'HUMAN_AGENT';

export interface MessageContent {
  text?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'audio' | 'file';
  quickReplies?: Array<{
    content_type: 'text';
    title: string;
    payload: string;
  }>;
  template?: {
    id: string;
    params?: Record<string, string>;
  };
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  campaignType: CampaignType;
  status: CampaignStatus;
  audienceType: AudienceType;
  messageContent: any;
  bypassMethod: BypassMethod | null;
  messageTag: MessageTag | null;
  scheduledAt: string | null;
  timezone: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListParams {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'scheduledAt' | 'sentCount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  campaignType: CampaignType;
  audienceType: AudienceType;
  audienceSegmentId?: string;
  audiencePageIds?: string[];
  audienceContactIds?: string[];
  messageContent: MessageContent;
  bypassMethod?: BypassMethod;
  messageTag?: MessageTag;
  scheduledAt?: string;
  timezone?: string;
  // Extensibility limits for DRIP matching DTO
  // recurringPattern?: RecurringPattern;
  // dripSequence?: DripStep[];
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  messageContent?: MessageContent;
  audienceType?: AudienceType;
  audienceSegmentId?: string;
  audiencePageIds?: string[];
  audienceContactIds?: string[];
  bypassMethod?: BypassMethod;
  messageTag?: MessageTag;
  scheduledAt?: string;
  timezone?: string;
}

export interface CampaignStats {
  id: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  deliveryRate: number;
  readRate: number;
  dailyStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
}

// ===========================================
// Campaign Service
// ===========================================

export const campaignService = {
  /**
   * Get campaigns with filters
   */
  async getCampaigns(workspaceId: string, params?: CampaignListParams): Promise<PaginatedResponse<Campaign>> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspaceId', workspaceId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return api.get<PaginatedResponse<Campaign>>(url);
  },

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    return api.get<Campaign>(`/campaigns/${campaignId}`);
  },

  /**
   * Create new campaign
   */
  async createCampaign(workspaceId: string, data: CreateCampaignRequest): Promise<Campaign> {
    return api.post<Campaign>('/campaigns', { ...data, workspaceId });
  },

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, data: UpdateCampaignRequest): Promise<Campaign> {
    return api.put<Campaign>(`/campaigns/${campaignId}`, data);
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/campaigns/${campaignId}`);
  },

  /**
   * Launch/start campaign
   */
  async launchCampaign(campaignId: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/launch`);
  },

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/pause`);
  },

  /**
   * Resume campaign
   */
  async resumeCampaign(campaignId: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/resume`);
  },

  /**
   * Cancel campaign
   */
  async cancelCampaign(campaignId: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/cancel`);
  },

  /**
   * Duplicate campaign
   */
  async duplicateCampaign(campaignId: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/duplicate`);
  },

  /**
   * Schedule campaign
   */
  async scheduleCampaign(campaignId: string, scheduledAt: string): Promise<Campaign> {
    return api.post<Campaign>(`/campaigns/${campaignId}/schedule`, { scheduledAt });
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    return api.get<CampaignStats>(`/campaigns/${campaignId}/stats`);
  },

  /**
   * Get campaign progress
   */
  async getCampaignProgress(campaignId: string): Promise<{ progress: number; sentCount: number; targetCount: number }> {
    return api.get<{ progress: number; sentCount: number; targetCount: number }>(`/campaigns/${campaignId}/progress`);
  },
};

export default campaignService;
