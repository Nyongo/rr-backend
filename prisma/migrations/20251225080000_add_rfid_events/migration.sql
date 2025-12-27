-- CreateEnum
CREATE TYPE "RfidEventType" AS ENUM ('ENTERED_BUS', 'EXITED_BUS');

-- CreateTable
CREATE TABLE "school_trip_rfid_events" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripStudentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "eventType" "RfidEventType" NOT NULL,
    "rfidTagId" TEXT NOT NULL,
    "deviceId" TEXT,
    "deviceLocation" TEXT,
    "gpsCoordinates" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_trip_rfid_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_trip_rfid_events_tripId_idx" ON "school_trip_rfid_events"("tripId");

-- CreateIndex
CREATE INDEX "school_trip_rfid_events_studentId_idx" ON "school_trip_rfid_events"("studentId");

-- CreateIndex
CREATE INDEX "school_trip_rfid_events_scannedAt_idx" ON "school_trip_rfid_events"("scannedAt");

-- AddForeignKey
ALTER TABLE "school_trip_rfid_events" ADD CONSTRAINT "school_trip_rfid_events_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "school_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trip_rfid_events" ADD CONSTRAINT "school_trip_rfid_events_tripStudentId_fkey" FOREIGN KEY ("tripStudentId") REFERENCES "school_trip_students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trip_rfid_events" ADD CONSTRAINT "school_trip_rfid_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

