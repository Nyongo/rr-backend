-- Update School model to match DTOs and remove unused fields
-- Make customerId required (NOT NULL)
ALTER TABLE "schools" 
  ALTER COLUMN "customerId" SET NOT NULL;

-- Rename lastUpdatedAt to updatedAt for consistency
ALTER TABLE "schools" 
  RENAME COLUMN "lastUpdatedAt" TO "updatedAt";

-- Add default UUID generation for id column
-- Note: This assumes id column already exists. If not, you may need to adjust.

-- Drop unused columns
ALTER TABLE "schools" 
  DROP COLUMN IF EXISTS "postalAddress",
  DROP COLUMN IF EXISTS "county",
  DROP COLUMN IF EXISTS "region",
  DROP COLUMN IF EXISTS "schoolType",
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "totalStudents",
  DROP COLUMN IF EXISTS "totalTeachers",
  DROP COLUMN IF EXISTS "registrationNumber",
  DROP COLUMN IF EXISTS "establishmentDate",
  DROP COLUMN IF EXISTS "locationPin";

-- Ensure id has default UUID generation
-- This is handled by Prisma's @default(uuid()) directive

