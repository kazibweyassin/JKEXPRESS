/** Portfolio sectors, credentials and client types shown on the public site. */

export const PROJECT_SECTORS = [
  { key: "COMMERCIAL", slug: "commercial", label: "Commercial" },
  { key: "OFFICES", slug: "offices", label: "Offices & fit-outs" },
  { key: "RESIDENTIAL", slug: "residential", label: "Residential" },
  { key: "MIXED_USE", slug: "mixed-use", label: "Mixed-use" },
  { key: "WAREHOUSING", slug: "warehousing", label: "Warehousing" },
  { key: "INSTITUTIONAL", slug: "institutional", label: "Institutional" },
] as const;

export type ProjectSector = (typeof PROJECT_SECTORS)[number]["key"];

export function sectorMeta(key?: string | null) {
  return PROJECT_SECTORS.find((item) => item.key === key) ?? null;
}

export const CREDENTIALS = [
  {
    title: "Uganda-registered developer",
    text: "JK Express Realtors & Developers Ltd. operates as a registered local company.",
  },
  {
    title: "Full lifecycle under one roof",
    text: "Construction, brokerage and property management stay with one accountable team.",
  },
  {
    title: "Site-supervised delivery",
    text: "Milestones, BOQ control and progress photography on every published project.",
  },
  {
    title: "Kampala · Entebbe · Jinja",
    text: "Local delivery across Uganda’s main growth corridors.",
  },
] as const;

export const CLIENT_TYPES = [
  { label: "Private developers", detail: "Estate and mixed-use partners" },
  { label: "Property owners", detail: "Sales, leasing and management" },
  { label: "Institutions", detail: "Offices, education and civic works" },
  { label: "Retail & commercial", detail: "Shops, hubs and roadside blocks" },
  { label: "Industrial occupiers", detail: "Sheds, yards and logistics shells" },
  { label: "Private households", detail: "Villas, apartments and family homes" },
] as const;

export const COMPANY_PROFILE_HREF = "/jk-express-company-profile.pdf";
