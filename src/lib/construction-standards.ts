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

export function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function padRef(prefix: string, year: number, seq: number) {
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}
