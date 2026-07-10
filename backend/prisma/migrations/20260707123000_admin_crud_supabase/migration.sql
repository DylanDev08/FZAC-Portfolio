CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "admin_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_profiles_email_key" ON "admin_profiles"("email");

CREATE TABLE IF NOT EXISTS "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

CREATE TABLE IF NOT EXISTS "works" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "client_name" TEXT,
  "location" TEXT,
  "address" TEXT,
  "short_description" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "category_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "cover_image_url" TEXT,
  "cover_image_path" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_by" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "works_slug_key" ON "works"("slug");
CREATE INDEX IF NOT EXISTS "works_category_id_idx" ON "works"("category_id");
CREATE INDEX IF NOT EXISTS "works_created_by_idx" ON "works"("created_by");

CREATE TABLE IF NOT EXISTS "work_images" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "work_id" UUID NOT NULL,
  "image_url" TEXT NOT NULL,
  "image_path" TEXT NOT NULL,
  "alt" TEXT NOT NULL DEFAULT '',
  "stage" TEXT NOT NULL DEFAULT 'gallery',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "work_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_images_work_id_idx" ON "work_images"("work_id");

CREATE TABLE IF NOT EXISTS "site_texts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "section" TEXT NOT NULL DEFAULT 'general',
  "key" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT NOT NULL DEFAULT '',
  "extra" JSONB NOT NULL DEFAULT '{}',
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "site_texts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "site_texts" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_texts" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS "site_texts_key_key" ON "site_texts"("key");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'work_images_stage_check'
  ) THEN
    ALTER TABLE "work_images" DROP CONSTRAINT "work_images_stage_check";
  END IF;

  ALTER TABLE "work_images"
    ADD CONSTRAINT "work_images_stage_check"
    CHECK ("stage" IN ('cover', 'gallery', 'before', 'process', 'final'));

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'works_category_id_fkey'
  ) THEN
    ALTER TABLE "works"
      ADD CONSTRAINT "works_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'work_images_work_id_fkey'
  ) THEN
    ALTER TABLE "work_images"
      ADD CONSTRAINT "work_images_work_id_fkey"
      FOREIGN KEY ("work_id") REFERENCES "works"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
