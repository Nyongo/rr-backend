-- Update School model to match DTOs and remove unused fields
-- This migration only applies if the schools table exists (for existing databases)
-- For fresh databases, the schema will be created correctly by Prisma

DO $$
BEGIN
  -- Only run if schools table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schools') THEN
    -- Rename lastUpdatedAt to updatedAt for consistency
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'lastUpdatedAt') THEN
      ALTER TABLE "schools" RENAME COLUMN "lastUpdatedAt" TO "updatedAt";
    END IF;

    -- Drop unused columns if they exist
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
  END IF;
END $$;

