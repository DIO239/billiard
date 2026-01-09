-- AlterTable
ALTER TABLE "type" ADD COLUMN IF NOT EXISTS "characteristicFields" JSONB;

-- AlterTable
ALTER TABLE "characteristic" ADD COLUMN IF NOT EXISTS "attributes" JSONB;
