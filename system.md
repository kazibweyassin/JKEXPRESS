# Construction operations — JK Express

Working spec for the Construction section of the dashboard. Original request: capture projects, company staff, subcontractors, financials, material purchase, quotations, weekly progress, contracts/IPCs/specifications, and stores.

## Chosen standard

**FIDIC Red Book practice, adapted for Uganda building works.**

| Decision | Why |
|---|---|
| Company-entered weekly progress | The subcontractor sends an update (WhatsApp, email, site meeting). A JK Express Site Engineer or Project Manager enters the official Weekly Progress Report after inspection. Subcontractors do not type into the register. |
| Employees = JK Express staff only | Subcontractor labour is never stored as company employees. |
| Specifications live on the contract | Not free-floating notes. |
| IPCs certify measured work | Monthly Interim Payment Certificates against the contract / BOQ, with retention. |

Alternatives considered: NEC ECC (heavier to administer); Ministry of Works / bespoke forms (store as `formOfContract` on the contract).

Code: `src/lib/construction-standards.ts`.

## Dashboard map

Construction nav group (`src/components/layout/dashboard-nav.ts`):

| Requirement | Route | Status |
|---|---|---|
| Projects | `/dashboard/projects` + `/dashboard/projects/[id]` | Built |
| Company employees (HR register) | `/dashboard/employees` (Admin group) | Built — company staff only |
| Company team on a project | Project detail → Company team | Built |
| Subcontractors | `/dashboard/contractors` + project packages | Built — register and assign |
| Project financials | Project detail → expenses + commercial control | Built — live from expenses, stores, IPCs |
| Material purchase | `/dashboard/procurement` | Built — request, quote, PO, GRN |
| Quotations | `/dashboard/quotations` + PDF | Built — accept creates a contract |
| Weekly progress | `/dashboard/progress` | Built — official project % is opt-in |
| Contracts, specs, IPCs | `/dashboard/contracts` | Built — auto previous certified, 10% retention |
| Stores & materials | `/dashboard/inventory` | Built — add, receive, issue |
| Equipment | `/dashboard/equipment` | Built — register and list |

## Data rules

1. **Projects** hold the job: client, location, dates, contract value, budget, expenditure, completion %.
2. **ProjectTeamMember** may only reference `Employee` (JK Express). Never a contractor worker.
3. **Contractor** is an external firm. Assign via `ProjectSubcontract` (package + sum) and/or `ConstructionContract` type `SUB`.
4. **WeeklyProgressReport** is the official week. `enteredBy` is always a logged-in JK user. Optional `contractorId` records whose package the update is about.
5. **ClientQuotation** is a JK Express offer to a client (not a supplier quote). Admin / QS generates it in the system and downloads a branded PDF.
6. **ConstructionContract** holds form of contract (FIDIC / MOWT / bespoke), specifications, and IPCs.
7. **InventoryItem** is company stores. Issue stock to a project; subcontractor-owned materials stay off this register.

## Implemented controls

Live as of 2026-09-10:

- Project expenditure recalculates from expenses + materials issued/received to site + certified/paid IPCs.
- Weekly package % does **not** overwrite the job unless “official project completion %” is chosen.
- Unique weekly report per project + week + package (company week when no contractor).
- IPC: cumulative gross − retention (default 10%) − previously certified. Period dates required. `projects:approve` to certify. Mark paid from the contract card.
- Stores: add item, receive into store, issue to site. PO goods-received posts into inventory.
- Register subcontractors, suppliers, equipment, and store items from the dashboard.
- Procurement: request → supplier quotes → select → approve/raise PO → receive.
- Project expense form on the project page.
- Awarding a subcontract also creates a SUB construction contract if none exists.
- Accepting a client quotation creates/links a MAIN contract (and a project if needed).
- Quotation / contract / IPC / PO / GRN numbers use unique year + nanoid refs.
- Executive dashboard: construction spend vs budget, unpaid IPCs, missing weekly reports, live projects.

### Still later

1. IPC measured against BOQ items, not a single gross-to-date figure.
2. Retention cap (for example 5% of contract sum) in addition to the 10% rate.
3. Link weekly reports to that week’s site-diary photographs.
4. Weighted project % from packages / BOQ instead of a single official weekly figure.

## Roles that touch this module

| Role | Typical work |
|---|---|
| Project Manager | Owns the project, reviews weekly reports, variations |
| Site Engineer | Enters weekly progress and site diary |
| Quantity Surveyor | Quotations, BOQ, contracts, IPCs |
| Procurement Officer | Purchase requests → orders |
| Storekeeper | Receive and issue materials |
| Accountant | Project expenditure, IPC payment |
| Super Administrator | All of the above |

Subcontractor, Supplier, Tenant, Buyer, Owner do **not** enter official construction records.
