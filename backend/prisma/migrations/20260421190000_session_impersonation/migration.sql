-- Super-admin impersonation: record which admin created the user session
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "impersonator_admin_id" TEXT;
