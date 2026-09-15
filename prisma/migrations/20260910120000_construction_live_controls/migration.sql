-- Live construction controls: unique weekly reports, official project progress flag,
-- and a link from an accepted client quotation to the construction contract.

DELETE FROM "WeeklyProgressReport" a
USING "WeeklyProgressReport" b
WHERE a.id < b.id
  AND a."projectId" = b."projectId"
  AND a."weekStarting" = b."weekStarting"
  AND a."contractorId" IS NOT DISTINCT FROM b."contractorId";

CREATE UNIQUE INDEX "WeeklyProgressReport_project_week_contractor_key"
  ON "WeeklyProgressReport"("projectId", "weekStarting", "contractorId")
  WHERE "contractorId" IS NOT NULL;

CREATE UNIQUE INDEX "WeeklyProgressReport_project_week_company_key"
  ON "WeeklyProgressReport"("projectId", "weekStarting")
  WHERE "contractorId" IS NULL;

ALTER TABLE "WeeklyProgressReport"
  ADD COLUMN "appliesToProject" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ConstructionContract"
  ADD COLUMN "quotationId" TEXT;

CREATE INDEX "ConstructionContract_quotationId_idx"
  ON "ConstructionContract"("quotationId");

ALTER TABLE "ConstructionContract"
  ADD CONSTRAINT "ConstructionContract_quotationId_fkey"
  FOREIGN KEY ("quotationId") REFERENCES "ClientQuotation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
