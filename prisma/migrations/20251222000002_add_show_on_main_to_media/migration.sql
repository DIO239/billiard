-- Add showOnMain field to media table
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "showOnMain" BOOLEAN NOT NULL DEFAULT true;
