-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('MORNING_PICKUP', 'EVENING_DROPOFF', 'FIELD_TRIP', 'EXTRA_CURRICULUM', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "RiderType" AS ENUM ('DAILY', 'OCCASIONAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "roleId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoggedInOn" TIMESTAMP(3),
    "requirePasswordReset" BOOLEAN NOT NULL DEFAULT false,
    "lastPasswordChangedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdatedAt" TIMESTAMP(3),
    "lastUpdatedById" INTEGER,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesticide" (
    "id" SERIAL NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "activeAgent" TEXT NOT NULL,
    "manufacturerOfRegistrant" TEXT NOT NULL,
    "localAgent" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "Pesticide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "kingdom" TEXT NOT NULL,
    "phylum" TEXT,
    "genus" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "Pest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "County" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "County_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "companyLogo" TEXT,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "numberOfSchools" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "principalName" TEXT,
    "principalPhone" TEXT,
    "principalEmail" TEXT,
    "customerId" INTEGER,
    "logo" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "photo" TEXT,
    "pin" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "school_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_minders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "photo" TEXT,
    "pin" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "school_minders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_parents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "school_parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "specialNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medicalInfo" TEXT NOT NULL,
    "photo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schoolId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_addresses" (
    "id" TEXT NOT NULL,
    "addressType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "parent_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "seatsCapacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "tripType" "TripType" NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "busId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_students" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "riderType" "RiderType" NOT NULL DEFAULT 'DAILY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "fuelType" TEXT,
    "mileage" INTEGER,
    "registrationExpiry" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,
    "averageFuelConsumption" DOUBLE PRECISION,
    "pricePerKm" DOUBLE PRECISION,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,
    "driverLicensePhoto" TEXT,
    "gender" TEXT NOT NULL,
    "idPhoto" TEXT,
    "nationalId" TEXT NOT NULL,
    "passportPhoto" TEXT,
    "psvLicenseDoc" TEXT,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "serviceProvider" TEXT,
    "invoiceNumber" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "mileageAtService" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "lastUpdatedById" INTEGER,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "distance" DOUBLE PRECISION,
    "feedback" TEXT,
    "fuelConsumption" DOUBLE PRECISION,
    "fuelCost" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pricePerKm" DOUBLE PRECISION NOT NULL,
    "rating" INTEGER,
    "totalPrice" DOUBLE PRECISION,
    "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "endGps" TEXT,
    "startGps" TEXT NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Pesticide_registrationNumber_key" ON "Pesticide"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Pesticide_name_key" ON "Pesticide"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pest_name_key" ON "Pest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pest_scientificName_key" ON "Pest"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "County_name_key" ON "County"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "ServiceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_emailAddress_key" ON "Customer"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_schoolId_key" ON "schools"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_drivers_pin_key" ON "school_drivers"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "school_minders_pin_key" ON "school_minders"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "students_admissionNumber_key" ON "students"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buses_registrationNumber_key" ON "buses"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "route_students_routeId_studentId_key" ON "route_students"("routeId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_nationalId_key" ON "Driver"("nationalId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesticide" ADD CONSTRAINT "Pesticide_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesticide" ADD CONSTRAINT "Pesticide_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_drivers" ADD CONSTRAINT "school_drivers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_minders" ADD CONSTRAINT "school_minders_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_parents" ADD CONSTRAINT "school_parents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "school_parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_addresses" ADD CONSTRAINT "parent_addresses_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "school_parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_students" ADD CONSTRAINT "route_students_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_students" ADD CONSTRAINT "route_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

