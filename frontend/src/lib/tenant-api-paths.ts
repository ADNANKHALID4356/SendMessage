import { getTenantSlugFromHost } from './tenant';

/**
 * Use `/tenant/...` API paths when the app is loaded on a tenant subdomain.
 * Workspace is resolved from Host (backend) and `X-Workspace-Id` from the client store.
 */
export function shouldUseTenantScopedApi(): boolean {
  return typeof window !== 'undefined' && !!getTenantSlugFromHost();
}
