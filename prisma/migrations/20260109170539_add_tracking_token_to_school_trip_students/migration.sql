-- AlterTable
ALTER TABLE "school_trip_students" ADD COLUMN IF NOT EXISTS "trackingToken" TEXT;

-- CreateIndex
-- Note: PostgreSQL unique constraint allows multiple NULL values, so this is safe
CREATE UNIQUE INDEX IF NOT EXISTS "school_trip_students_trackingToken_key" ON "school_trip_students"("trackingToken");
