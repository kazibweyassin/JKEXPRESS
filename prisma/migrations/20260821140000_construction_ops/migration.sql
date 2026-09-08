-- Construction operations: company team, subcontracts, weekly FIDIC reports,
-- client quotations, contracts, specifications, IPCs, store issues to projects.

CREATE TABLE "ProjectTeamMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SITE_STAFF',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectSubcontract" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "contractSum" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectSubcontract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeeklyProgressReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "weekStarting" TIMESTAMP(3) NOT NULL,
    "enteredById" TEXT NOT NULL,
    "contractorId" TEXT,
    "progressPercent" DOUBLE PRECISION,
    "workCompleted" TEXT,
    "labourOnSite" INTEGER,
    "materialsOnSite" TEXT,
    "delays" TEXT,
    "safetyNotes" TEXT,
    "nextWeekPlan" TEXT,
    "weather" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeeklyProgressReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientQuotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClientQuotation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientQuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'item',
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitRate" DECIMAL(65,30) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ClientQuotationItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConstructionContract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractorId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MAIN',
    "formOfContract" TEXT NOT NULL DEFAULT 'FIDIC',
    "contractSum" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConstructionContract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractSpecification" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "clause" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ContractSpecification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterimPaymentCertificate" (
    "id" TEXT NOT NULL,
    "ipcNumber" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "certifiedById" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "retention" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "previousPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterimPaymentCertificate_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StockTransaction" ADD COLUMN "projectId" TEXT;

CREATE UNIQUE INDEX "ProjectTeamMember_projectId_employeeId_role_key" ON "ProjectTeamMember"("projectId", "employeeId", "role");
CREATE UNIQUE INDEX "ClientQuotation_quotationNumber_key" ON "ClientQuotation"("quotationNumber");
CREATE UNIQUE INDEX "ConstructionContract_contractNumber_key" ON "ConstructionContract"("contractNumber");
CREATE UNIQUE INDEX "InterimPaymentCertificate_ipcNumber_key" ON "InterimPaymentCertificate"("ipcNumber");

ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectSubcontract" ADD CONSTRAINT "ProjectSubcontract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSubcontract" ADD CONSTRAINT "ProjectSubcontract_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WeeklyProgressReport" ADD CONSTRAINT "WeeklyProgressReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeeklyProgressReport" ADD CONSTRAINT "WeeklyProgressReport_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WeeklyProgressReport" ADD CONSTRAINT "WeeklyProgressReport_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClientQuotation" ADD CONSTRAINT "ClientQuotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClientQuotation" ADD CONSTRAINT "ClientQuotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClientQuotationItem" ADD CONSTRAINT "ClientQuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "ClientQuotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConstructionContract" ADD CONSTRAINT "ConstructionContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConstructionContract" ADD CONSTRAINT "ConstructionContract_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContractSpecification" ADD CONSTRAINT "ContractSpecification_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ConstructionContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterimPaymentCertificate" ADD CONSTRAINT "InterimPaymentCertificate_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ConstructionContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterimPaymentCertificate" ADD CONSTRAINT "InterimPaymentCertificate_certifiedById_fkey" FOREIGN KEY ("certifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ConstructionProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
