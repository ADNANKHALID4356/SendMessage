import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { WorkspaceId } from '../workspaces/decorators/workspace-id.decorator';
import { PagesService } from './pages.service';
import { PageSyncService } from './page-sync.service';
import { UpdatePageDto } from './dto';

/**
 * Tenant-first pages API (workspace from subdomain / X-Workspace-Id for admins).
 * Legacy: `GET/... /workspaces/:workspaceId/pages/...`
 */
@ApiTags('pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Controller('tenant/pages')
export class TenantPagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly pageSyncService: PageSyncService,
  ) {}

  @Get()
  @Roles('VIEW_ONLY')
  @ApiOperation({ summary: 'Get all pages for current tenant workspace' })
  @ApiResponse({ status: 200, description: 'List of pages' })
  async findAll(@WorkspaceId() workspaceId: string) {
    return this.pagesService.findByWorkspace(workspaceId);
  }

  @Post('sync-all')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Sync all pages for workspace' })
  async syncAllPages(@WorkspaceId() workspaceId: string) {
    return this.pageSyncService.syncAllPages(workspaceId);
  }

  @Get('health')
  @Roles('VIEW_ONLY')
  @ApiOperation({ summary: 'Get page health status' })
  async getPageHealth(@WorkspaceId() workspaceId: string) {
    return this.pageSyncService.getPageHealthStatus(workspaceId);
  }

  @Get(':id')
  @Roles('VIEW_ONLY')
  @ApiOperation({ summary: 'Get page details' })
  @ApiParam({ name: 'id', description: 'Page UUID' })
  async findById(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.getPageWithDetails(id, workspaceId);
  }

  @Get(':id/stats')
  @Roles('VIEW_ONLY')
  @ApiOperation({ summary: 'Get page statistics' })
  async getStats(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.getStats(id, workspaceId);
  }

  @Put(':id')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Update page settings' })
  async update(
    @WorkspaceId() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  @Roles('MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a page' })
  async deactivate(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.pagesService.deactivate(id, workspaceId);
  }

  @Post(':id/reactivate')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Reactivate a page' })
  async reactivate(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.reactivate(id, workspaceId);
  }

  @Post(':id/sync')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Sync page info from Facebook' })
  async sync(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.syncPageInfo(id, workspaceId);
  }

  @Get(':id/token/validate')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Validate page access token' })
  async validateToken(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.validateToken(id, workspaceId);
  }

  @Post(':id/webhook/fix')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Check and fix webhook subscription' })
  async fixWebhook(@WorkspaceId() workspaceId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.checkAndFixWebhook(id, workspaceId);
  }
}
