ALTER TABLE "ClientQuotation"
ADD COLUMN "clientAddress" TEXT,
ADD COLUMN "siteLocation" TEXT,
ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "contingencyRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN "scopeOfWorks" TEXT,
ADD COLUMN "inclusions" TEXT,
ADD COLUMN "exclusions" TEXT,
ADD COLUMN "paymentTerms" TEXT,
ADD COLUMN "duration" TEXT,
ADD COLUMN "warranty" TEXT,
ADD COLUMN "variationTerms" TEXT,
ADD COLUMN "preparedBy" TEXT,
ADD COLUMN "approvedBy" TEXT,
ADD COLUMN "bankDetails" TEXT;

ALTER TABLE "ClientQuotationItem"
ADD COLUMN "section" TEXT NOT NULL DEFAULT 'General';
