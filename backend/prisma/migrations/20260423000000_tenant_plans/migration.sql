-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantPlanCode" AS ENUM ('BASIC', 'STANDARD', 'GROWTH', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "UserSystemRole" AS ENUM ('TENANT_ADMIN', 'TENANT_USER');

-- CreateTable
CREATE TABLE "tenants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(63) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
  "plan_code" "TenantPlanCode" NOT NULL DEFAULT 'BASIC',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "tenant_id" UUID,
ADD COLUMN "system_role" "UserSystemRole" NOT NULL DEFAULT 'TENANT_USER';

-- AlterTable
ALTER TABLE "workspaces"
ADD COLUMN "tenant_id" UUID;

-- AddForeignKey
ALTER TABLE "users"
ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces"
ADD CONSTRAINT "workspaces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Helpful indexes for quota checks
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "workspaces_tenant_id_idx" ON "workspaces"("tenant_id");

