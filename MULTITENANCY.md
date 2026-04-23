# Multi-tenancy

## Backend

- **`BASE_DOMAIN`**: apex domain used to parse tenant subdomains (e.g. `app.test` → tenant `acme` on `acme.app.test`).
- **`ADMIN_HOSTS`**: comma-separated hostnames that skip tenant resolution (e.g. `admin.app.test`).
- **`DEFAULT_TENANT_DAILY_SEND_CAP`**: optional Redis-backed daily send cap per workspace (`0` = disabled).

## Frontend

- **`NEXT_PUBLIC_BASE_DOMAIN`**: must match backend `BASE_DOMAIN` for subdomain detection.
- **`NEXT_PUBLIC_ADMIN_HOSTS`**: optional; same idea as `ADMIN_HOSTS` for UI hints.

## Local development

Use hosts entries or `nip.io`/`lvh.me` so the browser sends a `Host` like `default.localhost` while API runs on the same machine. Point `NEXT_PUBLIC_API_URL` at your API (or same-origin proxy).

## Prisma P2022 after upgrade (admin login 500)

If login shows **P2022** (column missing), your Postgres schema is behind the Prisma models. From the **repo root**, with Postgres up and `backend/.env` `DATABASE_URL` set:

1. **Option A (preferred):** `pnpm db:migrate:deploy` — same as `pnpm db:migrate:prod`; applies all `prisma/migrations`. Do **not** use `pnpm --filter backend prisma migrate deploy` (no `prisma` script on that package).
2. **One-shot dev prep:** `pnpm dev:prepare` — runs migrate deploy then `pnpm db:generate`.
3. **Fallback SQL:** `pnpm --filter backend db:repair-tenant-columns` (idempotent repair file).

Then restart the API. Run `pnpm db:seed` if you still have no admin user.

## E2E / integration tests (backend)

- Run: `pnpm --filter backend test:e2e` (requires Postgres + Redis + the same env vars as CI: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `REDIS_HOST` / `REDIS_PORT`).
- Skip bootstrapping the real app: `SKIP_E2E_TESTS=true pnpm --filter backend test:e2e` (CI-friendly on machines without a DB).
- Full stack locally: `pnpm test:all` (backend unit + frontend unit + E2E).

## Auth hardening

Access/refresh tokens are stored in `localStorage` today. For production SaaS, prefer **httpOnly cookies** + CSRF for the browser and keep bearer tokens for native/API clients only.

## API routes

- **Tenant-first (preferred):** `/tenant/pages/...`, `/tenant/analytics/...`, `/tenant/facebook/...` (workspace from subdomain + membership).
- **Legacy:** `/workspaces/:workspaceId/pages/...`, `/facebook/workspaces/:workspaceId/...`, etc.

## Super-admin

- `PATCH /admin/tenants/:workspaceId` with `UpdateWorkspaceDto` (e.g. `{ "isActive": false }`) to disable a tenant; audited in `ActivityLog`.
- `POST /admin/impersonate` with `{ "userId": "<uuid>" }` returns user tokens; profile includes `impersonatorAdminId`.
- `POST /auth/impersonation/end` (Bearer: impersonated user JWT) ends the session and returns **admin** tokens again.
- `GET /admin/tenants/health` for per-workspace counts.
