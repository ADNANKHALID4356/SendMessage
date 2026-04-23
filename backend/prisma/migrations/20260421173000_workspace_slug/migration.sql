-- Add tenant slug to workspaces (DNS-safe label for subdomain routing)
ALTER TABLE "workspaces" ADD COLUMN "slug" VARCHAR(63);

-- Backfill existing rows with a deterministic unique slug derived from id
UPDATE "workspaces"
SET "slug" = lower(substring(replace("id"::text, '-', ''), 1, 20))
WHERE "slug" IS NULL;

ALTER TABLE "workspaces" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");
