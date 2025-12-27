-- AlterTable
-- Check if columns exist before adding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Borrower' AND column_name = 'cbsClientId') THEN
        ALTER TABLE "Borrower" ADD COLUMN "cbsClientId" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Borrower' AND column_name = 'cbsResourceId') THEN
        ALTER TABLE "Borrower" ADD COLUMN "cbsResourceId" INTEGER;
    END IF;
END $$;







