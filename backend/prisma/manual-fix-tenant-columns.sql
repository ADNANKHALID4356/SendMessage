-- Idempotent repair for Prisma P2022 when DB was created with `db push` or old migrations
-- but the app expects multitenant columns from:
--   migrations/20260421190000_session_impersonation
--   migrations/20260421173000_workspace_slug
--
-- Run from repo root (with Postgres up and DATABASE_URL set):
--   pnpm --filter backend db:repair-tenant-columns

ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "impersonator_admin_id" TEXT;

ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(63);

UPDATE "workspaces"
SET "slug" = lower(substring(replace("id"::text, '-', ''), 1, 20))
WHERE "slug" IS NULL OR trim(coalesce("slug", '')) = '';

ALTER TABLE "workspaces" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_slug_key" ON "workspaces"("slug");
