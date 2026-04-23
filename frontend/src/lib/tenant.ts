const RESERVED = new Set(['www', 'api', 'admin', 'app', 'mail', 'ftp', 'cdn', 'static']);

/**
 * Returns tenant slug from browser hostname when using `{slug}.{BASE}`.
 * `NEXT_PUBLIC_BASE_DOMAIN` should match backend `BASE_DOMAIN` (e.g. `app.local` or `localhost`).
 */
export function getTenantSlugFromHost(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname.toLowerCase();
  const base = (process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost').toLowerCase();

  if (host === base || host === `www.${base}`) {
    return null;
  }

  const suffix = `.${base}`;
  if (!host.endsWith(suffix)) {
    return null;
  }

  const sub = host.slice(0, host.length - suffix.length);
  if (!sub || RESERVED.has(sub)) {
    return null;
  }

  return sub;
}

export function isAdminPortalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const adminHosts = (process.env.NEXT_PUBLIC_ADMIN_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return adminHosts.includes(host);
}
