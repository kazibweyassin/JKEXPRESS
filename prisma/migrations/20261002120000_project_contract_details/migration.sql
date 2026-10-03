ALTER TABLE "ConstructionProject"
  ADD COLUMN "procurementRefNo" TEXT,
  ADD COLUMN "supervisingConsultant" TEXT,
  ADD COLUMN "contractor" TEXT,
  ADD COLUMN "extendedCompletion" TIMESTAMP(3),
  ADD COLUMN "amendedContractValue" DECIMAL(65,30),
  ADD COLUMN "contractCurrency" TEXT NOT NULL DEFAULT 'UGX',
  ADD COLUMN "contractSignatureDate" TIMESTAMP(3);