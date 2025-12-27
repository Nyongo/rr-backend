-- AlterTable
ALTER TABLE "routes" ADD COLUMN IF NOT EXISTS "minderId" TEXT;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_minderId_fkey" FOREIGN KEY ("minderId") REFERENCES "school_minders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

