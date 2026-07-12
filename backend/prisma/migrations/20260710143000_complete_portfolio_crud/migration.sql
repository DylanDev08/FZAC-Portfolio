ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "year" TEXT;
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "process_text" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "completion_text" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "video" TEXT;
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "video_gallery" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "branches" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "stages" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "points" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "works" DROP CONSTRAINT IF EXISTS "works_status_check";
ALTER TABLE "works" ADD CONSTRAINT "works_status_check"
  CHECK ("status" IN ('draft', 'published', 'archived', 'finalizada', 'construyendo', 'por-comenzar'));

CREATE INDEX IF NOT EXISTS "works_status_sort_order_idx" ON "works"("status", "sort_order");
CREATE INDEX IF NOT EXISTS "work_images_work_stage_sort_idx" ON "work_images"("work_id", "stage", "sort_order");
