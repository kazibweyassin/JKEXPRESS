import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const sample = "SAMPLE";

async function main() {
  const actor = await db.user.findFirst({ where: { isActive: true, deletedAt: null } });
  if (!actor) throw new Error("No active dashboard user exists. Run npm run db:seed first.");

  const project = await db.constructionProject.upsert({
    where: { code: `${sample}-CON-001` },
    update: { completionPercentage: 30, currentExpenditure: 240_000_000, status: "ACTIVE" },
    create: {
      code: `${sample}-CON-001`, slug: "sample-kampala-residential-build",
      name: "Sample Kampala Residential Build",
      description: "Sample dashboard project demonstrating construction controls from mobilisation through handover.",
      clientName: "Sample Client Ltd", location: "Kira Road", city: "Kampala",
      startDate: new Date("2026-07-01"), expectedCompletion: new Date("2027-03-31"),
      contractValue: 850_000_000, approvedBudget: 800_000_000,
      currentExpenditure: 240_000_000, completionPercentage: 30,
      status: "ACTIVE", isPublished: false, featuredImage: "/site-photos/site-03.jpeg",
    },
  });

  await db.clientQuotation.upsert({
    where: { quotationNumber: `${sample}-QT-001` },
    update: { projectId: project.id, status: "DRAFT" },
    create: {
      quotationNumber: `${sample}-QT-001`, title: "Sample structural and building works quotation",
      clientName: "Sample Client Ltd", clientEmail: "sample.client@example.com",
      clientPhone: "+256 700 000 100", siteLocation: "Kira Road, Kampala",
      projectId: project.id, createdById: actor.id, currency: "UGX", taxRate: 18,
      contingencyRate: 5, duration: "36 weeks",
      scopeOfWorks: "Mobilisation, substructure, reinforced concrete frame, blockwork and preliminary finishes.",
      inclusions: "Labour, materials, supervision, standard plant and quality checks.",
      exclusions: "Statutory fees, utility connections and client variations.",
      paymentTerms: "20% mobilisation; balance against measured monthly progress.",
      warranty: "12-month defects liability period from practical completion.",
      notes: "SAMPLE RECORD — replace with confirmed client information before issue.", status: "DRAFT",
      items: { create: [
        { section: "Preliminaries", description: "Site mobilisation and temporary works", unit: "item", quantity: 1, unitRate: 25_000_000, sortOrder: 1 },
        { section: "Structure", description: "Reinforced concrete structural frame", unit: "m2", quantity: 420, unitRate: 650_000, sortOrder: 2 },
        { section: "Walls", description: "External and internal blockwork", unit: "m2", quantity: 680, unitRate: 95_000, sortOrder: 3 },
      ] },
    },
  });

  const weekStarting = new Date("2026-08-24");
  const report = await db.weeklyProgressReport.findFirst({ where: { projectId: project.id, weekStarting } });
  const progress = {
    progressPercent: 30, workCompleted: "Completed ground-floor columns and commenced first-floor beam formwork.",
    labourOnSite: 24, materialsOnSite: "Cement, reinforcement, timber formwork and concrete blocks.",
    delays: "One afternoon lost to heavy rainfall; no programme impact forecast.",
    safetyNotes: "Toolbox talk, PPE and edge-protection checks completed.",
    nextWeekPlan: "Complete beam reinforcement, MEP sleeves and first-floor slab pour.",
    weather: "Mixed sun and rain", status: "SUBMITTED",
  };
  if (report) await db.weeklyProgressReport.update({ where: { id: report.id }, data: progress });
  else await db.weeklyProgressReport.create({ data: { projectId: project.id, weekStarting, enteredById: actor.id, ...progress } });

  const contract = await db.constructionContract.upsert({
    where: { contractNumber: `${sample}-CONTRACT-001` },
    update: { projectId: project.id, status: "ACTIVE" },
    create: {
      contractNumber: `${sample}-CONTRACT-001`, projectId: project.id,
      title: "Sample main building contract", type: "MAIN", formOfContract: "BESPOKE",
      contractSum: 850_000_000, currency: "UGX", startDate: new Date("2026-07-01"),
      endDate: new Date("2027-03-31"), status: "ACTIVE",
      specifications: { create: [
        { clause: "1.1", title: "Scope and drawings", description: "Execute works to approved drawings and specifications.", sortOrder: 1 },
        { clause: "4.2", title: "Quality control", description: "Maintain material approvals and inspection records.", sortOrder: 2 },
      ] },
    },
  });

  await db.interimPaymentCertificate.upsert({
    where: { ipcNumber: `${sample}-IPC-001` }, update: { contractId: contract.id, status: "CERTIFIED" },
    create: {
      ipcNumber: `${sample}-IPC-001`, contractId: contract.id, certifiedById: actor.id,
      periodStart: new Date("2026-08-01"), periodEnd: new Date("2026-08-31"),
      grossAmount: 120_000_000, retention: 6_000_000, previousPaid: 40_000_000,
      amountDue: 74_000_000, currency: "UGX", status: "CERTIFIED",
      notes: "Sample certificate based on illustrative measured progress.",
    },
  });

  await db.purchaseRequest.upsert({
    where: { requestNumber: `${sample}-PR-001` }, update: { projectId: project.id, status: "SUBMITTED" },
    create: {
      requestNumber: `${sample}-PR-001`, requesterId: actor.id, projectId: project.id,
      title: "Sample reinforcement steel purchase",
      justification: "Steel required for first-floor beam and slab reinforcement.", status: "SUBMITTED",
      items: { create: [{ description: "Y16 high-yield reinforcement bars", quantity: 180, unit: "length", estimatedUnitCost: 68_000 }] },
    },
  });

  const warehouse = await db.warehouse.upsert({
    where: { code: `${sample}-WH` }, update: { name: "Sample Construction Store" },
    create: { code: `${sample}-WH`, name: "Sample Construction Store", location: "Kampala" },
  });
  await db.inventoryItem.upsert({
    where: { sku: `${sample}-CEM-001` }, update: { quantityOnHand: 85, warehouseId: warehouse.id },
    create: { sku: `${sample}-CEM-001`, name: "Sample Portland Cement 42.5N", category: "MATERIALS", unit: "bag", quantityOnHand: 85, reorderLevel: 40, unitCost: 39_500, warehouseId: warehouse.id },
  });

  await db.equipment.upsert({
    where: { code: `${sample}-EQ-001` }, update: { condition: "GOOD", currentLocation: project.name },
    create: { code: `${sample}-EQ-001`, name: "Sample 400L Concrete Mixer", category: "PLANT", condition: "GOOD", currentLocation: project.name, assignedTo: "Site team", nextServiceDate: new Date("2026-10-15") },
  });

  console.log("Created/refreshed samples for Projects, Quotations, Weekly Progress, Contracts/IPCs, Material Purchase, Stores/Materials and Equipment.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
