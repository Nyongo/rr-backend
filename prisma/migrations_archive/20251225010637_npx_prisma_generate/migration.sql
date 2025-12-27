/*
  Warnings:

  - You are about to drop the column `sslId` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the `ActiveDebt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssetTitle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditedFinancial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Borrower` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CaseStudy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CaseStudySection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CrbConsent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditApplicationComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CropsInFarm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DirectPaymentSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EnrollmentVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FarmerFarm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FarmerUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeePlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialSurvey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HomeVisit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvestmentCommittee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MpesaBankStatement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Newsletter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsletterSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsletterSectionMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherSupportingDoc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payroll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Referrer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SectionMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceRequestCrops` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceRequestService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SspBidding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SspSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SspUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentBreakdown` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VendorDisbursementDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_work_plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ssl_staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaseStudySection" DROP CONSTRAINT "CaseStudySection_caseStudyId_fkey";

-- DropForeignKey
ALTER TABLE "CropsInFarm" DROP CONSTRAINT "CropsInFarm_cropId_fkey";

-- DropForeignKey
ALTER TABLE "CropsInFarm" DROP CONSTRAINT "CropsInFarm_farmId_fkey";

-- DropForeignKey
ALTER TABLE "FarmerFarm" DROP CONSTRAINT "FarmerFarm_countyId_fkey";

-- DropForeignKey
ALTER TABLE "FarmerFarm" DROP CONSTRAINT "FarmerFarm_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "FarmerUser" DROP CONSTRAINT "FarmerUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "NewsletterSection" DROP CONSTRAINT "NewsletterSection_newsletterId_fkey";

-- DropForeignKey
ALTER TABLE "NewsletterSectionMedia" DROP CONSTRAINT "NewsletterSectionMedia_newsletterSectionId_fkey";

-- DropForeignKey
ALTER TABLE "SectionMedia" DROP CONSTRAINT "SectionMedia_caseStudySectionId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_assignedSspId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_farmId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestCrops" DROP CONSTRAINT "ServiceRequestCrops_cropId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestCrops" DROP CONSTRAINT "ServiceRequestCrops_serviceRequestId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestService" DROP CONSTRAINT "ServiceRequestService_serviceRequestId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestService" DROP CONSTRAINT "ServiceRequestService_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "SspBidding" DROP CONSTRAINT "SspBidding_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "SspBidding" DROP CONSTRAINT "SspBidding_serviceRequestId_fkey";

-- DropForeignKey
ALTER TABLE "SspBidding" DROP CONSTRAINT "SspBidding_sspId_fkey";

-- DropForeignKey
ALTER TABLE "SspSchedule" DROP CONSTRAINT "SspSchedule_serviceRequestId_fkey";

-- DropForeignKey
ALTER TABLE "SspSchedule" DROP CONSTRAINT "SspSchedule_sspId_fkey";

-- DropForeignKey
ALTER TABLE "SspUser" DROP CONSTRAINT "SspUser_countyId_fkey";

-- DropForeignKey
ALTER TABLE "SspUser" DROP CONSTRAINT "SspUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "daily_work_plan" DROP CONSTRAINT "daily_work_plan_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "daily_work_plan" DROP CONSTRAINT "daily_work_plan_sslStaffId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "sales_order_items" DROP CONSTRAINT "sales_order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_categoryId_fkey";

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "sslId";

-- DropTable
DROP TABLE "ActiveDebt";

-- DropTable
DROP TABLE "AssetTitle";

-- DropTable
DROP TABLE "AuditedFinancial";

-- DropTable
DROP TABLE "Borrower";

-- DropTable
DROP TABLE "CaseStudy";

-- DropTable
DROP TABLE "CaseStudySection";

-- DropTable
DROP TABLE "ContactMessage";

-- DropTable
DROP TABLE "ContractDetails";

-- DropTable
DROP TABLE "CrbConsent";

-- DropTable
DROP TABLE "CreditApplication";

-- DropTable
DROP TABLE "CreditApplicationComment";

-- DropTable
DROP TABLE "CropsInFarm";

-- DropTable
DROP TABLE "DirectPaymentSchedule";

-- DropTable
DROP TABLE "Director";

-- DropTable
DROP TABLE "EnrollmentVerification";

-- DropTable
DROP TABLE "FarmerFarm";

-- DropTable
DROP TABLE "FarmerUser";

-- DropTable
DROP TABLE "FeePlan";

-- DropTable
DROP TABLE "FinancialSurvey";

-- DropTable
DROP TABLE "HomeVisit";

-- DropTable
DROP TABLE "InvestmentCommittee";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "MpesaBankStatement";

-- DropTable
DROP TABLE "Newsletter";

-- DropTable
DROP TABLE "NewsletterSection";

-- DropTable
DROP TABLE "NewsletterSectionMedia";

-- DropTable
DROP TABLE "OtherSupportingDoc";

-- DropTable
DROP TABLE "Payroll";

-- DropTable
DROP TABLE "Referrer";

-- DropTable
DROP TABLE "SectionMedia";

-- DropTable
DROP TABLE "ServiceRequest";

-- DropTable
DROP TABLE "ServiceRequestCrops";

-- DropTable
DROP TABLE "ServiceRequestService";

-- DropTable
DROP TABLE "SspBidding";

-- DropTable
DROP TABLE "SspSchedule";

-- DropTable
DROP TABLE "SspUser";

-- DropTable
DROP TABLE "StudentBreakdown";

-- DropTable
DROP TABLE "VendorDisbursementDetail";

-- DropTable
DROP TABLE "daily_work_plan";

-- DropTable
DROP TABLE "product_categories";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "sales_order_items";

-- DropTable
DROP TABLE "sales_orders";

-- DropTable
DROP TABLE "ssl_staff";

-- DropTable
DROP TABLE "suppliers";

-- DropEnum
DROP TYPE "MessageStatus";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "NewsletterCategory";

-- DropEnum
DROP TYPE "Platform";

-- DropEnum
DROP TYPE "SectionType";
