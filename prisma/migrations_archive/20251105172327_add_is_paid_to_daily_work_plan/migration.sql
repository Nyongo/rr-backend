/*
  Warnings:

  - You are about to drop the column `totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleIn` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleIn",
ADD COLUMN     "totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleInsurance" TEXT;

-- AlterTable
-- Check if column exists before adding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_work_plan' AND column_name = 'isPaid') THEN
        ALTER TABLE "daily_work_plan" ADD COLUMN "isPaid" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
