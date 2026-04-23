-- Fix-up migration:
-- Prisma previously applied a migration that changed `tenants.id` and `tenant_id` columns to TEXT.
-- We want UUIDs without data loss. All existing values are UUID strings.

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_tenant_id_fkey";
ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "workspaces_tenant_id_fkey";

-- Cast tenant_id columns back to UUID (safe if values are UUID strings or NULL)
ALTER TABLE "users"
  ALTER COLUMN "tenant_id" TYPE UUID USING NULLIF("tenant_id", '')::uuid;

ALTER TABLE "workspaces"
  ALTER COLUMN "tenant_id" TYPE UUID USING NULLIF("tenant_id", '')::uuid;

-- Cast tenants.id back to UUID (safe if values are UUID strings)
ALTER TABLE "tenants"
  ALTER COLUMN "id" TYPE UUID USING NULLIF("id", '')::uuid;

-- Restore UUID default for new tenant IDs
ALTER TABLE "tenants"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "users"
  ADD CONSTRAINT "users_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "workspaces"
  ADD CONSTRAINT "workspaces_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
