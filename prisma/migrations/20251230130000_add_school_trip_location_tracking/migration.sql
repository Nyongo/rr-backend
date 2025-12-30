-- CreateTable
CREATE TABLE IF NOT EXISTS "school_trip_locations" (
    "id" SERIAL NOT NULL,
    "tripId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,

    CONSTRAINT "school_trip_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "school_trip_locations_tripId_timestamp_idx" ON "school_trip_locations"("tripId", "timestamp");

-- AddForeignKey
ALTER TABLE "school_trip_locations" ADD CONSTRAINT "school_trip_locations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "school_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

