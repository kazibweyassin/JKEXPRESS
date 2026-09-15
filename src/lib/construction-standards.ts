/**
 * Construction record-keeping standard used in this dashboard.
 *
 * Chosen standard: FIDIC (Red Book) practice, adapted for Uganda building works.
 *
 * Why FIDIC weekly reports (not a contractor self-portal):
 * - The subcontractor sends progress (email, WhatsApp, site meeting).
 * - A JK Express employee — normally the Site Engineer or Project Manager —
 *   enters the official Weekly Progress Report. That person is the "Engineer"
 *   / employer's representative in FIDIC terms.
 * - Subcontractor labour is NOT stored as company employees.
 * - Monthly Interim Payment Certificates (IPCs) certify measured work against
 *   the contract / BOQ, with retention.
 * - Specifications sit on the construction contract, not as free-floating notes.
 *
 * Alternatives considered:
 * - NEC ECC: stronger on early warnings and programmes; heavier to administer.
 * - Ministry of Works / local bespoke: usable for public jobs; store as formOfContract.
 */

export const PROGRESS_STANDARD = {
  name: "FIDIC weekly progress (company-entered)",
  short: "FIDIC",
  enteredBy: "JK Express Site Engineer or Project Manager",
  source: "Subcontractor weekly update and site inspection",
} as const;

export const TEAM_ROLES = [
  { value: "PROJECT_MANAGER", label: "Project manager" },
  { value: "SITE_ENGINEER", label: "Site engineer" },
  { value: "QUANTITY_SURVEYOR", label: "Quantity surveyor" },
  { value: "STOREKEEPER", label: "Storekeeper" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "SITE_STAFF", label: "Site staff" },
] as const;

export const SUBCONTRACT_STATUSES = [
  "TENDERED",
  "AWARDED",
  "ACTIVE",
  "COMPLETED",
  "TERMINATED",
] as const;

export const DEFAULT_RETENTION_RATE = 10;

export function mondayOf(date: Date): Date {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = utc.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  utc.setUTCDate(utc.getUTCDate() + diff);
  return utc;
}

export function padRef(prefix: string, year: number, seq: number) {
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

export function ipcCertificate(input: {
  grossAmount: number;
  previousCertified: number;
  retentionRate?: number;
  retentionAmount?: number;
}) {
  const grossAmount = Number(input.grossAmount) || 0;
  const previousCertified = Number(input.previousCertified) || 0;
  const rate =
    input.retentionRate == null || Number.isNaN(Number(input.retentionRate))
      ? DEFAULT_RETENTION_RATE
      : Number(input.retentionRate);
  const retention =
    input.retentionAmount != null && !Number.isNaN(Number(input.retentionAmount))
      ? Number(input.retentionAmount)
      : (grossAmount * rate) / 100;
  const amountDue = Math.round((grossAmount - retention - previousCertified) * 100) / 100;
  return {
    grossAmount,
    retention,
    previousPaid: previousCertified,
    amountDue,
  };
}

export function shouldUpdateProjectProgress(appliesToProject: boolean) {
  return appliesToProject === true;
}

export function projectExpenditureTotal(parts: {
  expenses: number;
  materials: number;
  certifiedWork: number;
}) {
  return (
    (Number(parts.expenses) || 0) +
    (Number(parts.materials) || 0) +
    (Number(parts.certifiedWork) || 0)
  );
}

export function quotationGrandTotal(input: {
  items: Array<{ quantity: number; unitRate: number }>;
  discount?: number;
  taxRate?: number;
  contingencyRate?: number;
}) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitRate),
    0,
  );
  const contingency = subtotal * (Number(input.contingencyRate || 0) / 100);
  const taxable = Math.max(0, subtotal + contingency - Number(input.discount || 0));
  return taxable + taxable * (Number(input.taxRate || 0) / 100);
}
