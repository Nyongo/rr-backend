-- Drop tables in order to handle foreign key constraints
-- Drop junction/relation tables first, then main tables

-- Drop Ecommerce tables
DROP TABLE IF EXISTS "sales_order_items" CASCADE;
DROP TABLE IF EXISTS "sales_orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "suppliers" CASCADE;
DROP TABLE IF EXISTS "product_categories" CASCADE;

-- Drop Case Study and Newsletter tables
DROP TABLE IF EXISTS "SectionMedia" CASCADE;
DROP TABLE IF EXISTS "CaseStudySection" CASCADE;
DROP TABLE IF EXISTS "CaseStudy" CASCADE;
DROP TABLE IF EXISTS "NewsletterSectionMedia" CASCADE;
DROP TABLE IF EXISTS "NewsletterSection" CASCADE;
DROP TABLE IF EXISTS "Newsletter" CASCADE;

-- Drop ContactMessage table
DROP TABLE IF EXISTS "ContactMessage" CASCADE;

-- Drop SSL Tracker tables
DROP TABLE IF EXISTS "daily_work_plan" CASCADE;
DROP TABLE IF EXISTS "ssl_staff" CASCADE;

-- Drop SSP-related tables
DROP TABLE IF EXISTS "SspBidding" CASCADE;
DROP TABLE IF EXISTS "SspSchedule" CASCADE;
DROP TABLE IF EXISTS "ServiceRequestCrops" CASCADE;
DROP TABLE IF EXISTS "ServiceRequestService" CASCADE;
DROP TABLE IF EXISTS "ServiceRequest" CASCADE;
DROP TABLE IF EXISTS "CropsInFarm" CASCADE;
DROP TABLE IF EXISTS "FarmerFarm" CASCADE;
DROP TABLE IF EXISTS "FarmerUser" CASCADE;
DROP TABLE IF EXISTS "SspUser" CASCADE;
-- Note: ServiceType is kept as it's used by the configs module

-- Drop JF-related tables (in dependency order)
DROP TABLE IF EXISTS "DirectPaymentSchedule" CASCADE;
DROP TABLE IF EXISTS "CreditApplicationComment" CASCADE;
DROP TABLE IF EXISTS "ContractDetails" CASCADE;
DROP TABLE IF EXISTS "AssetTitle" CASCADE;
DROP TABLE IF EXISTS "HomeVisit" CASCADE;
DROP TABLE IF EXISTS "VendorDisbursementDetail" CASCADE;
DROP TABLE IF EXISTS "InvestmentCommittee" CASCADE;
DROP TABLE IF EXISTS "OtherSupportingDoc" CASCADE;
DROP TABLE IF EXISTS "StudentBreakdown" CASCADE;
DROP TABLE IF EXISTS "AuditedFinancial" CASCADE;
DROP TABLE IF EXISTS "MpesaBankStatement" CASCADE;
DROP TABLE IF EXISTS "EnrollmentVerification" CASCADE;
DROP TABLE IF EXISTS "Payroll" CASCADE;
DROP TABLE IF EXISTS "FeePlan" CASCADE;
DROP TABLE IF EXISTS "ActiveDebt" CASCADE;
DROP TABLE IF EXISTS "CreditApplication" CASCADE;
DROP TABLE IF EXISTS "Referrer" CASCADE;
DROP TABLE IF EXISTS "CrbConsent" CASCADE;
DROP TABLE IF EXISTS "Director" CASCADE;
DROP TABLE IF EXISTS "Loan" CASCADE;
DROP TABLE IF EXISTS "FinancialSurvey" CASCADE;
DROP TABLE IF EXISTS "Borrower" CASCADE;

-- Drop enums that are no longer needed
DROP TYPE IF EXISTS "MessageType" CASCADE;
DROP TYPE IF EXISTS "Platform" CASCADE;
DROP TYPE IF EXISTS "MessageStatus" CASCADE;
DROP TYPE IF EXISTS "SectionType" CASCADE;
DROP TYPE IF EXISTS "NewsletterCategory" CASCADE;
DROP TYPE IF EXISTS "CustomerStatus" CASCADE;

