import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

/**
 * Optional per-tenant daily send cap (Redis-backed). Set DEFAULT_TENANT_DAILY_SEND_CAP > 0 to enable.
 */
@Injectable()
export class TenantQuotaService {
  private readonly logger = new Logger(TenantQuotaService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async consumeSendSlot(workspaceId: string): Promise<void> {
    const cap = this.config.get<number>('DEFAULT_TENANT_DAILY_SEND_CAP', 0);
    if (!cap || cap <= 0) {
      return;
    }

    const day = new Date().toISOString().slice(0, 10);
    const key = `quota:workspace:${workspaceId}:sends:${day}`;
    const n = await this.redis.incr(key);
    if (n === 1) {
      await this.redis.expire(key, 172800);
    }
    if (n > cap) {
      await this.redis.decr(key);
      this.logger.warn(`Workspace ${workspaceId} exceeded daily send cap (${cap})`);
      throw new HttpException('Daily send quota exceeded for this workspace', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
