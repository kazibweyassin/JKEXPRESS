-- Construction control: photographic site evidence and variation management.
CREATE TABLE "SiteReportPhoto" (
    "id" TEXT NOT NULL,
    "siteReportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteReportPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VariationOrder" (
    "id" TEXT NOT NULL,
    "variationNumber" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "extensionDays" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VariationOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VariationOrder_variationNumber_key" ON "VariationOrder"("variationNumber");
CREATE INDEX "SiteReportPhoto_siteReportId_idx" ON "SiteReportPhoto"("siteReportId");
CREATE INDEX "VariationOrder_projectId_idx" ON "VariationOrder"("projectId");
CREATE INDEX "VariationOrder_status_idx" ON "VariationOrder"("status");

ALTER TABLE "SiteReportPhoto" ADD CONSTRAINT "SiteReportPhoto_siteReportId_fkey"
FOREIGN KEY ("siteReportId") REFERENCES "SiteReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VariationOrder" ADD CONSTRAINT "VariationOrder_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
