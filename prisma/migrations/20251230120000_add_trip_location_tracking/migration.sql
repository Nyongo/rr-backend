-- CreateTable
CREATE TABLE IF NOT EXISTS "trip_locations" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,

    CONSTRAINT "trip_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "trip_locations_tripId_timestamp_idx" ON "trip_locations"("tripId", "timestamp");

-- AddForeignKey
ALTER TABLE "trip_locations" ADD CONSTRAINT "trip_locations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

