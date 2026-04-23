import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceId } from '../workspaces/decorators/workspace-id.decorator';
import { FacebookService } from './facebook.service';
import { ConnectPageDto, InitiateOAuthTenantDto } from './dto';

/**
 * Tenant-first Facebook integration (workspace from subdomain / `X-Workspace-Id` for admins).
 * Legacy: `/facebook/workspaces/:workspaceId/...`
 */
@ApiTags('facebook')
@ApiBearerAuth()
@Controller('tenant/facebook')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class TenantFacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('oauth/initiate')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Initiate Facebook OAuth for current tenant workspace' })
  @ApiResponse({ status: 200, description: 'Returns authorization URL' })
  async initiateOAuth(
    @WorkspaceId() workspaceId: string,
    @Body() body: InitiateOAuthTenantDto,
    @CurrentUser() user: { userId: string },
  ) {
    const authUrl = await this.facebookService.initiateOAuth(
      { workspaceId, redirectUrl: body.redirectUrl },
      user.userId,
    );
    return { authUrl };
  }

  @Get('status')
  @Roles('VIEW_ONLY')
  @ApiOperation({ summary: 'Facebook connection status for current tenant' })
  async getConnectionStatus(@WorkspaceId() workspaceId: string) {
    return this.facebookService.getConnectionStatus(workspaceId);
  }

  @Post('pages')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Connect a Facebook page to current tenant workspace' })
  async connectPage(@WorkspaceId() workspaceId: string, @Body() dto: ConnectPageDto) {
    return this.facebookService.connectPage(workspaceId, dto);
  }

  @Delete('pages/:pageId')
  @Roles('MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a Facebook page' })
  @ApiParam({ name: 'pageId', description: 'Page UUID' })
  async disconnectPage(
    @WorkspaceId() workspaceId: string,
    @Param('pageId', ParseUUIDPipe) pageId: string,
  ) {
    await this.facebookService.disconnectPage(workspaceId, pageId);
  }

  @Delete('disconnect')
  @Roles('MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect Facebook account from current tenant workspace' })
  async disconnectAccount(@WorkspaceId() workspaceId: string) {
    await this.facebookService.disconnectAccount(workspaceId);
  }

  @Post('mock/connect')
  @Roles('MANAGER')
  @ApiOperation({ summary: '[DEV ONLY] Mock Facebook connection for current tenant' })
  async mockConnect(@WorkspaceId() workspaceId: string, @CurrentUser() user: { userId: string }) {
    const mockMode = process.env.FACEBOOK_MOCK_MODE === 'true';
    if (!mockMode) {
      throw new BadRequestException('Mock mode is not enabled');
    }
    return this.facebookService.createMockConnection(workspaceId, user.userId);
  }
}
