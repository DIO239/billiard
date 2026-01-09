-- Remove old characteristic fields
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "height";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "weight";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "material";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "wood";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "master";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "country";
ALTER TABLE "characteristic" DROP COLUMN IF EXISTS "parts";
