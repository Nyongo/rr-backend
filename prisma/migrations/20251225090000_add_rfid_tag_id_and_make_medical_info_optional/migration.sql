-- AlterTable
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "rfidTagId" TEXT;

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "medicalInfo" DROP NOT NULL;

