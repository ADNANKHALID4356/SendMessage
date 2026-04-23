import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'admin', 'app', 'mail', 'ftp', 'cdn', 'static']);

@Injectable()
export class TenantHostMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantHostMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const url = req.originalUrl || req.url || '';
      if (url.startsWith('/api/v1/health') || url.startsWith('/docs')) {
        return next();
      }

      const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase();
      if (!hostHeader) return next();

      const baseDomain = (this.config.get<string>('BASE_DOMAIN') || 'localhost').toLowerCase();
      const adminHosts = (this.config.get<string>('ADMIN_HOSTS') || '')
        .split(',')
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);

      if (adminHosts.includes(hostHeader) || hostHeader === baseDomain || hostHeader === `www.${baseDomain}`) {
        return next();
      }

      const suffix = `.${baseDomain}`;
      if (!hostHeader.endsWith(suffix)) {
        return next();
      }

      const sub = hostHeader.slice(0, Math.max(0, hostHeader.length - suffix.length));
      if (!sub || RESERVED_SUBDOMAINS.has(sub)) {
        return next();
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: sub },
        select: { id: true, slug: true, status: true },
      });

      if (!tenant || tenant.status !== 'ACTIVE') {
        return next();
      }

      (req as any).tenantId = tenant.id;
      (req as any).tenantSlug = tenant.slug;
    } catch (e: any) {
      this.logger.warn(`Tenant host resolution failed: ${e?.message || e}`);
    }

    return next();
  }
}
