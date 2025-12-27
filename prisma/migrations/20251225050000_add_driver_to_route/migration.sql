-- AlterTable
ALTER TABLE "routes" ADD COLUMN IF NOT EXISTS "driverId" TEXT;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "school_drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

