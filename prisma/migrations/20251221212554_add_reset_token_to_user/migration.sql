-- AlterTable
-- Add resetToken and resetTokenExpires columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='resetToken') THEN
        ALTER TABLE "user" ADD COLUMN "resetToken" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='resetTokenExpires') THEN
        ALTER TABLE "user" ADD COLUMN "resetTokenExpires" TIMESTAMP;
    END IF;
END $$;

