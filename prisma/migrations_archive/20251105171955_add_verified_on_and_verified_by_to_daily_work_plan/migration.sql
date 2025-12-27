/*
  Warnings:

  - You are about to drop the column `totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleIn` on the `Loan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleIn",
ADD COLUMN     "totalLiabilityAmountIncludingPenaltiesAndComprehensiveVehicleInsurance" TEXT;

-- AlterTable
-- Check if columns exist before adding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_work_plan' AND column_name = 'verifiedBy') THEN
        ALTER TABLE "daily_work_plan" ADD COLUMN "verifiedBy" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_work_plan' AND column_name = 'verifiedOn') THEN
        ALTER TABLE "daily_work_plan" ADD COLUMN "verifiedOn" TIMESTAMP(3);
    END IF;
END $$;
