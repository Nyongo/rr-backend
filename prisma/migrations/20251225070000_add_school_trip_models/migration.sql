-- CreateEnum
CREATE TYPE "SchoolTripStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "PickupDropoffStatus" AS ENUM ('NOT_PICKED_UP', 'PICKED_UP', 'NOT_DROPPED_OFF', 'DROPPED_OFF', 'ABSENT', 'EXCUSED');

-- CreateTable
CREATE TABLE "school_trips" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "busId" TEXT,
    "driverId" TEXT,
    "minderId" TEXT,
    "tripDate" TIMESTAMP(3) NOT NULL,
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "scheduledEndTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "status" "SchoolTripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "startLocation" TEXT,
    "endLocation" TEXT,
    "startGps" TEXT,
    "endGps" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "school_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_trip_students" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "pickupStatus" "PickupDropoffStatus" NOT NULL DEFAULT 'NOT_PICKED_UP',
    "dropoffStatus" "PickupDropoffStatus" NOT NULL DEFAULT 'NOT_DROPPED_OFF',
    "scheduledPickupTime" TIMESTAMP(3),
    "actualPickupTime" TIMESTAMP(3),
    "scheduledDropoffTime" TIMESTAMP(3),
    "actualDropoffTime" TIMESTAMP(3),
    "pickupLocation" TEXT,
    "dropoffLocation" TEXT,
    "pickupGps" TEXT,
    "dropoffGps" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_trip_students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_trip_students_tripId_studentId_key" ON "school_trip_students"("tripId", "studentId");

-- AddForeignKey
ALTER TABLE "school_trips" ADD CONSTRAINT "school_trips_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trips" ADD CONSTRAINT "school_trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trips" ADD CONSTRAINT "school_trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "school_drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trips" ADD CONSTRAINT "school_trips_minderId_fkey" FOREIGN KEY ("minderId") REFERENCES "school_minders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trip_students" ADD CONSTRAINT "school_trip_students_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "school_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_trip_students" ADD CONSTRAINT "school_trip_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

