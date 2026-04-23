import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/analytics')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get workspace analytics overview' })
  async getOverview(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsService.getOverview(workspaceId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get message analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getMessageStats(
    @CurrentWorkspace() workspaceId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getMessageStats(workspaceId, days);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get campaign analytics' })
  async getCampaignStats(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsService.getCampaignStats(workspaceId);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get contact growth analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getContactGrowth(
    @CurrentWorkspace() workspaceId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getContactGrowth(workspaceId, days);
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get page performance analytics' })
  async getPagePerformance(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsService.getPagePerformance(workspaceId);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement metrics' })
  async getEngagementMetrics(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsService.getEngagementMetrics(workspaceId);
  }
}
