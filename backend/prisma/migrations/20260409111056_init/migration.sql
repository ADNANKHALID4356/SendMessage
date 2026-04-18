-- CreateEnum
CREATE TYPE "CampaignLogStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DripStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "pages" ALTER COLUMN "profile_picture_url" SET DATA TYPE TEXT,
ALTER COLUMN "cover_photo_url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "invitation_expires_at" TIMESTAMP(3),
ADD COLUMN     "invitation_token" VARCHAR(255);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(500),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "fail_reason" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_tag_usage" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "message_tag" "MessageTag" NOT NULL,
    "message_id" TEXT,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_tag_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_logs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "message_id" TEXT,
    "status" "CampaignLogStatus" NOT NULL DEFAULT 'PENDING',
    "variant" VARCHAR(10),
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_message" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drip_progress" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL,
    "status" "DripStatus" NOT NULL DEFAULT 'ACTIVE',
    "next_message_at" TIMESTAMP(3),
    "last_message_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drip_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "fb_attachment_id" VARCHAR(255),
    "fb_attachment_url" TEXT,
    "uploaded_by_admin_id" TEXT,
    "uploaded_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_queue" (
    "id" TEXT NOT NULL,
    "job_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempts_identifier_idx" ON "login_attempts"("identifier");

-- CreateIndex
CREATE INDEX "login_attempts_ip_address_idx" ON "login_attempts"("ip_address");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts"("created_at");

-- CreateIndex
CREATE INDEX "message_tag_usage_contact_id_idx" ON "message_tag_usage"("contact_id");

-- CreateIndex
CREATE INDEX "message_tag_usage_page_id_idx" ON "message_tag_usage"("page_id");

-- CreateIndex
CREATE INDEX "message_tag_usage_message_tag_idx" ON "message_tag_usage"("message_tag");

-- CreateIndex
CREATE INDEX "message_tag_usage_used_at_idx" ON "message_tag_usage"("used_at");

-- CreateIndex
CREATE INDEX "campaign_logs_campaign_id_idx" ON "campaign_logs"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_logs_contact_id_idx" ON "campaign_logs"("contact_id");

-- CreateIndex
CREATE INDEX "campaign_logs_status_idx" ON "campaign_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_logs_campaign_id_contact_id_key" ON "campaign_logs"("campaign_id", "contact_id");

-- CreateIndex
CREATE INDEX "drip_progress_campaign_id_idx" ON "drip_progress"("campaign_id");

-- CreateIndex
CREATE INDEX "drip_progress_contact_id_idx" ON "drip_progress"("contact_id");

-- CreateIndex
CREATE INDEX "drip_progress_status_idx" ON "drip_progress"("status");

-- CreateIndex
CREATE INDEX "drip_progress_next_message_at_idx" ON "drip_progress"("next_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "drip_progress_campaign_id_contact_id_key" ON "drip_progress"("campaign_id", "contact_id");

-- CreateIndex
CREATE INDEX "attachments_workspace_id_idx" ON "attachments"("workspace_id");

-- CreateIndex
CREATE INDEX "attachments_fb_attachment_id_idx" ON "attachments"("fb_attachment_id");

-- CreateIndex
CREATE INDEX "job_queue_job_type_idx" ON "job_queue"("job_type");

-- CreateIndex
CREATE INDEX "job_queue_status_idx" ON "job_queue"("status");

-- CreateIndex
CREATE INDEX "job_queue_scheduled_at_idx" ON "job_queue"("scheduled_at");

-- CreateIndex
CREATE INDEX "job_queue_priority_idx" ON "job_queue"("priority");

-- AddForeignKey
ALTER TABLE "message_tag_usage" ADD CONSTRAINT "message_tag_usage_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_tag_usage" ADD CONSTRAINT "message_tag_usage_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_progress" ADD CONSTRAINT "drip_progress_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drip_progress" ADD CONSTRAINT "drip_progress_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
