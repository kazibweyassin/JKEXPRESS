"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ipcCertificate,
  mondayOf,
  projectExpenditureTotal,
  quotationGrandTotal,
  shouldUpdateProjectProgress,
} from "@/lib/construction-standards";
import { hasPermission } from "@/lib/permissions";
import { parseQuotationFormData } from "@/lib/quotation-pdf";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function requireUser(
  resource: "projects" | "inventory" | "procurement" | "contractors" | "suppliers" | "equipment",
  action: "create" | "edit" | "approve",
) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, resource, action)) {
    return null;
  }
  return session.user;
}

function reference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
}

function optionalDate(value: FormDataEntryValue | null) {
  const raw = String(value || "");
  return raw ? new Date(raw) : undefined;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function revalidateConstruction(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

export async function syncProjectExpenditure(projectId: string) {
  if (!projectId) return;
  const [expenseAgg, materialTx, contracts] = await Promise.all([
    db.expense.aggregate({
      where: { projectId, deletedAt: null },
      _sum: { amount: true },
    }),
    db.stockTransaction.findMany({
      where: { projectId, type: { in: ["ISSUE", "RECEIPT"] } },
      include: { item: { select: { unitCost: true } } },
    }),
    db.constructionContract.findMany({
      where: { projectId },
      include: {
        ipcs: { where: { status: { in: ["CERTIFIED", "PAID"] } } },
      },
    }),
  ]);
  const expenses = Number(expenseAgg._sum.amount ?? 0);
  const materials = materialTx.reduce(
    (sum, tx) => sum + Number(tx.quantity) * Number(tx.item.unitCost ?? 0),
    0,
  );
  const certifiedWork = contracts.reduce(
    (sum, contract) =>
      sum + contract.ipcs.reduce((ipcSum, ipc) => ipcSum + Number(ipc.amountDue), 0),
    0,
  );
  await db.constructionProject.update({
    where: { id: projectId },
    data: {
      currentExpenditure: projectExpenditureTotal({ expenses, materials, certifiedWork }),
    },
  });
}

export async function createConstructionProject(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const data = z.object({
      name: z.string().min(3).max(160), clientName: z.string().max(160).optional(),
      location: z.string().max(200).optional(), city: z.string().max(100).optional(),
      description: z.string().max(3000).optional(), projectManagerId: z.string().optional(),
      contractValue: z.coerce.number().nonnegative().optional(), approvedBudget: z.coerce.number().nonnegative().optional(),
    }).parse({
      name: formData.get("name"), clientName: formData.get("clientName") || undefined,
      location: formData.get("location") || undefined, city: formData.get("city") || undefined,
      description: formData.get("description") || undefined,
      projectManagerId: formData.get("projectManagerId") || undefined,
      contractValue: formData.get("contractValue") || undefined,
      approvedBudget: formData.get("approvedBudget") || undefined,
    });
    const project = await db.constructionProject.create({ data: {
      ...data, code: reference("PRJ"), slug: `${slugify(data.name)}-${nanoid(5).toLowerCase()}`,
      startDate: optionalDate(formData.get("startDate")),
      expectedCompletion: optionalDate(formData.get("expectedCompletion")), status: "PLANNING",
    }});
    revalidatePath("/dashboard/projects");
    return { success: true, id: project.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the project. Check the required fields." };
  }
}

export async function addProjectPlanItem(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "edit");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const projectId = z.string().min(1).parse(formData.get("projectId"));
    const kind = z.enum(["PHASE", "MILESTONE", "TASK"]).parse(formData.get("kind"));
    const name = z.string().min(2).max(200).parse(formData.get("name"));
    const dueDate = optionalDate(formData.get("dueDate"));
    if (kind === "PHASE") await db.projectPhase.create({ data: { projectId, name, endDate: dueDate } });
    else if (kind === "MILESTONE") await db.projectMilestone.create({ data: { projectId, name, dueDate } });
    else await db.projectTask.create({ data: { projectId, title: name, dueDate, createdById: user.id } });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not add the programme item." };
  }
}

export async function createBoq(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const projectId = z.string().min(1).parse(formData.get("projectId"));
    const title = z.string().min(2).max(160).parse(formData.get("title"));
    const lines = String(formData.get("items") || "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return { success: false, error: "Add at least one BOQ item." };
    const items = lines.map((line, index) => {
      const [section, itemNumber, description, unit, quantity, rate] = line.split("|").map((part) => part.trim());
      const estimatedQuantity = Number(quantity); const unitRate = Number(rate);
      if (!description || !unit || !Number.isFinite(estimatedQuantity) || !Number.isFinite(unitRate)) throw new Error(`Invalid BOQ line ${index + 1}`);
      return { section: section || "General", itemNumber: itemNumber || String(index + 1), description, unit, estimatedQuantity, unitRate, estimatedTotal: estimatedQuantity * unitRate };
    });
    const boq = await db.bOQ.create({ data: { projectId, title, status: "DRAFT", items: { create: items } } });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, id: boq.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the BOQ. Use: section | item | description | unit | quantity | rate." };
  }
}

export async function createSiteReport(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const projectId = z.string().min(1).parse(formData.get("projectId"));
    const workCompleted = z.string().min(3).max(4000).parse(formData.get("workCompleted"));
    const photoUrls = String(formData.get("photoUrls") || "").split("\n").map((url) => url.trim()).filter(Boolean);
    const report = await db.siteReport.create({ data: {
      projectId, submittedById: user.id, reportDate: optionalDate(formData.get("reportDate")) ?? new Date(),
      weather: String(formData.get("weather") || "") || null,
      workersPresent: formData.get("workersPresent") ? Number(formData.get("workersPresent")) : null,
      workCompleted, equipmentUsed: String(formData.get("equipmentUsed") || "") || null,
      materialsReceived: String(formData.get("materialsReceived") || "") || null,
      safetyObservations: String(formData.get("safetyObservations") || "") || null,
      delays: String(formData.get("delays") || "") || null,
      nextDayPlan: String(formData.get("nextDayPlan") || "") || null,
      photos: photoUrls.length ? { create: photoUrls.map((url) => ({ url })) } : undefined,
    }});
    revalidatePath(`/dashboard/projects/${projectId}`); revalidatePath("/dashboard/progress");
    return { success: true, id: report.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the site diary." };
  }
}

export async function createVariationOrder(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const projectId = z.string().min(1).parse(formData.get("projectId"));
    const title = z.string().min(3).max(200).parse(formData.get("title"));
    const variation = await db.variationOrder.create({ data: {
      variationNumber: reference("VO"), projectId, title,
      description: String(formData.get("description") || "") || null,
      reason: String(formData.get("reason") || "") || null,
      amount: Number(formData.get("amount") || 0), extensionDays: Number(formData.get("extensionDays") || 0), status: "SUBMITTED",
    }});
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, id: variation.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not submit the variation." };
  }
}

export async function createPurchaseRequest(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("procurement", "create");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const title = z.string().min(3).max(180).parse(formData.get("title"));
    const projectId = String(formData.get("projectId") || "") || null;
    const lines = String(formData.get("items") || "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return { success: false, error: "Add at least one requested item." };
    const items = lines.map((line) => {
      const [description, quantity, unit, estimatedUnitCost] = line.split("|").map((part) => part.trim());
      if (!description || Number(quantity) <= 0 || !unit) throw new Error("Invalid request item");
      return { description, quantity: Number(quantity), unit, estimatedUnitCost: estimatedUnitCost ? Number(estimatedUnitCost) : null };
    });
    const request = await db.purchaseRequest.create({ data: {
      requestNumber: reference("PR"), requesterId: user.id, projectId, title,
      justification: String(formData.get("justification") || "") || null, status: "SUBMITTED", items: { create: items },
    }});
    revalidatePath("/dashboard/procurement");
    return { success: true, id: request.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not submit the purchase request. Use: description | quantity | unit | estimated rate." };
  }
}

export async function createClientQuotation(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const parsed = parseQuotationFormData(formData);
    if (!parsed.ok) return { success: false, error: parsed.error };

    const projectId = String(formData.get("projectId") || "") || null;
    const quotation = await db.clientQuotation.create({
      data: {
        quotationNumber: reference("QT"),
        title: parsed.data.title,
        clientName: parsed.data.clientName,
        clientEmail: parsed.data.clientEmail,
        clientPhone: parsed.data.clientPhone,
        clientAddress: parsed.data.clientAddress,
        siteLocation: parsed.data.siteLocation,
        projectId,
        createdById: user.id,
        currency: parsed.data.currency,
        revision: parsed.data.revision,
        discount: parsed.data.discount,
        taxRate: parsed.data.taxRate,
        contingencyRate: parsed.data.contingencyRate,
        scopeOfWorks: parsed.data.scopeOfWorks,
        inclusions: parsed.data.inclusions,
        exclusions: parsed.data.exclusions,
        paymentTerms: parsed.data.paymentTerms,
        duration: parsed.data.duration,
        warranty: parsed.data.warranty,
        variationTerms: parsed.data.variationTerms,
        preparedBy: parsed.data.preparedBy,
        approvedBy: parsed.data.approvedBy,
        bankDetails: parsed.data.bankDetails,
        notes: parsed.data.notes,
        validUntil: parsed.data.validUntil,
        status: "DRAFT",
        items: {
          create: parsed.data.items.map((item, index) => ({
            description: item.description,
            section: item.section || "General",
            quantity: item.quantity,
            unitRate: item.unitRate,
            unit: item.unit,
            sortOrder: index,
          })),
        },
      },
    });

    revalidateConstruction(["/dashboard/quotations", `/dashboard/quotations/${quotation.id}/pdf`]);
    return { success: true, id: quotation.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save quotation. Check the database connection." };
  }
}

export async function acceptClientQuotation(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "approve");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const quotationId = String(formData.get("quotationId") || "");
    if (!quotationId) return { success: false, error: "Quotation is required." };

    const quotation = await db.clientQuotation.findUnique({
      where: { id: quotationId },
      include: { items: true, project: true, contracts: true },
    });
    if (!quotation) return { success: false, error: "Quotation not found." };
    if (quotation.status === "DECLINED" || quotation.status === "EXPIRED") {
      return { success: false, error: "This quotation cannot be accepted." };
    }
    if (quotation.contracts.length) {
      await db.clientQuotation.update({
        where: { id: quotationId },
        data: { status: "ACCEPTED" },
      });
      revalidateConstruction(["/dashboard/quotations", "/dashboard/contracts"]);
      return { success: true, id: quotation.contracts[0].id };
    }

    const total = quotationGrandTotal({
      items: quotation.items.map((item) => ({
        quantity: Number(item.quantity),
        unitRate: Number(item.unitRate),
      })),
      discount: Number(quotation.discount),
      taxRate: Number(quotation.taxRate),
      contingencyRate: Number(quotation.contingencyRate),
    });

    let projectId = quotation.projectId;
    if (!projectId) {
      const project = await db.constructionProject.create({
        data: {
          name: quotation.title,
          clientName: quotation.clientName,
          location: quotation.siteLocation,
          contractValue: total,
          approvedBudget: total,
          code: reference("PRJ"),
          slug: `${slugify(quotation.title)}-${nanoid(5).toLowerCase()}`,
          status: "PLANNING",
        },
      });
      projectId = project.id;
      await db.clientQuotation.update({
        where: { id: quotationId },
        data: { projectId, status: "ACCEPTED" },
      });
    } else {
      await db.clientQuotation.update({
        where: { id: quotationId },
        data: { status: "ACCEPTED" },
      });
    }

    const contract = await db.constructionContract.create({
      data: {
        contractNumber: reference("CON"),
        projectId,
        quotationId,
        title: quotation.title,
        type: "MAIN",
        formOfContract: "FIDIC",
        contractSum: total,
        currency: quotation.currency,
        status: "EXECUTED",
      },
    });

    revalidateConstruction([
      "/dashboard/quotations",
      "/dashboard/contracts",
      "/dashboard/projects",
      `/dashboard/projects/${projectId}`,
    ]);
    return { success: true, id: contract.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not accept the quotation." };
  }
}

export async function createWeeklyProgress(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const parsed = z
      .object({
        projectId: z.string().min(1),
        weekStarting: z.string().min(1),
        contractorId: z.string().optional(),
        progressPercent: z.coerce.number().min(0).max(100).optional(),
        workCompleted: z.string().optional(),
        labourOnSite: z.coerce.number().int().optional(),
        materialsOnSite: z.string().optional(),
        delays: z.string().optional(),
        safetyNotes: z.string().optional(),
        nextWeekPlan: z.string().optional(),
        weather: z.string().optional(),
        appliesToProject: z.string().optional(),
      })
      .parse({
        projectId: formData.get("projectId"),
        weekStarting: formData.get("weekStarting"),
        contractorId: formData.get("contractorId") || undefined,
        progressPercent: formData.get("progressPercent") || undefined,
        workCompleted: formData.get("workCompleted") || undefined,
        labourOnSite: formData.get("labourOnSite") || undefined,
        materialsOnSite: formData.get("materialsOnSite") || undefined,
        delays: formData.get("delays") || undefined,
        safetyNotes: formData.get("safetyNotes") || undefined,
        nextWeekPlan: formData.get("nextWeekPlan") || undefined,
        weather: formData.get("weather") || undefined,
        appliesToProject: formData.get("appliesToProject") || undefined,
      });

    const weekStarting = mondayOf(new Date(parsed.weekStarting));
    const contractorId = parsed.contractorId || null;
    const appliesToProject = shouldUpdateProjectProgress(parsed.appliesToProject === "true");

    const duplicate = await db.weeklyProgressReport.findFirst({
      where: {
        projectId: parsed.projectId,
        weekStarting,
        contractorId,
      },
    });
    if (duplicate) {
      return {
        success: false,
        error: "A weekly report already exists for this project, week and package.",
      };
    }

    const report = await db.weeklyProgressReport.create({
      data: {
        projectId: parsed.projectId,
        weekStarting,
        enteredById: user.id,
        contractorId,
        progressPercent: parsed.progressPercent,
        workCompleted: parsed.workCompleted,
        labourOnSite: parsed.labourOnSite,
        materialsOnSite: parsed.materialsOnSite,
        delays: parsed.delays,
        safetyNotes: parsed.safetyNotes,
        nextWeekPlan: parsed.nextWeekPlan,
        weather: parsed.weather,
        appliesToProject,
        status: "SUBMITTED",
      },
    });

    if (appliesToProject && parsed.progressPercent != null) {
      await db.constructionProject.update({
        where: { id: parsed.projectId },
        data: { completionPercentage: parsed.progressPercent },
      });
    }

    revalidateConstruction(["/dashboard/progress", `/dashboard/projects/${parsed.projectId}`]);
    return { success: true, id: report.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save weekly report. Check the database connection." };
  }
}

export async function assignProjectEmployee(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const projectId = String(formData.get("projectId") || "");
    const employeeId = String(formData.get("employeeId") || "");
    const role = String(formData.get("role") || "SITE_STAFF");
    if (!projectId || !employeeId) return { success: false, error: "Project and employee are required." };

    await db.projectTeamMember.create({
      data: { projectId, employeeId, role },
    });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not assign employee (must be company staff)." };
  }
}

export async function assignProjectSubcontractor(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const projectId = String(formData.get("projectId") || "");
    const contractorId = String(formData.get("contractorId") || "");
    const packageName = String(formData.get("packageName") || "");
    const contractSum = optionalNumber(formData.get("contractSum"));
    if (!projectId || !contractorId || !packageName) {
      return { success: false, error: "Project, subcontractor and package are required." };
    }

    await db.projectSubcontract.create({
      data: {
        projectId,
        contractorId,
        packageName,
        contractSum,
        status: "ACTIVE",
      },
    });

    const existing = await db.constructionContract.findFirst({
      where: { projectId, contractorId, type: "SUB" },
    });
    if (!existing) {
      await db.constructionContract.create({
        data: {
          contractNumber: reference("CON"),
          projectId,
          contractorId,
          title: packageName,
          type: "SUB",
          formOfContract: "FIDIC",
          contractSum,
          status: "ACTIVE",
        },
      });
    }

    revalidateConstruction([`/dashboard/projects/${projectId}`, "/dashboard/contracts"]);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not assign subcontractor." };
  }
}

export async function createConstructionContract(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const projectId = String(formData.get("projectId") || "");
    const title = String(formData.get("title") || "");
    const type = String(formData.get("type") || "MAIN");
    const formOfContract = String(formData.get("formOfContract") || "FIDIC");
    const contractorId = String(formData.get("contractorId") || "") || null;
    const contractSum = optionalNumber(formData.get("contractSum"));
    const specText = String(formData.get("specifications") || "");
    if (!projectId || !title) return { success: false, error: "Project and title are required." };

    const specs = specText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [clause, ...rest] = line.split(":");
        return {
          clause: clause?.trim() || `S${index + 1}`,
          title: rest.join(":").trim() || line,
          sortOrder: index,
        };
      });

    const contract = await db.constructionContract.create({
      data: {
        contractNumber: reference("CON"),
        projectId,
        contractorId,
        title,
        type,
        formOfContract,
        contractSum,
        status: "DRAFT",
        specifications: specs.length ? { create: specs } : undefined,
      },
    });

    revalidatePath("/dashboard/contracts");
    return { success: true, id: contract.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save contract." };
  }
}

export async function addContractSpecification(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const contractId = String(formData.get("contractId") || "");
    const clause = String(formData.get("clause") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    if (!contractId || !title) return { success: false, error: "Contract and specification title are required." };

    const last = await db.contractSpecification.findFirst({
      where: { contractId },
      orderBy: { sortOrder: "desc" },
    });
    await db.contractSpecification.create({
      data: {
        contractId,
        clause: clause || `S${(last?.sortOrder ?? -1) + 2}`,
        title,
        description,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    revalidatePath("/dashboard/contracts");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not add the specification." };
  }
}

export async function createIpc(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "approve");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const contractId = String(formData.get("contractId") || "");
    const grossAmount = Number(formData.get("grossAmount") || 0);
    const notes = String(formData.get("notes") || "") || null;
    const periodStart = optionalDate(formData.get("periodStart"));
    const periodEnd = optionalDate(formData.get("periodEnd"));
    if (!contractId || !grossAmount) {
      return { success: false, error: "Contract and cumulative gross amount are required." };
    }
    if (!periodStart || !periodEnd) {
      return { success: false, error: "IPC period start and end dates are required." };
    }
    if (periodEnd < periodStart) {
      return { success: false, error: "Period end must be on or after the start date." };
    }

    const contract = await db.constructionContract.findUnique({
      where: { id: contractId },
      include: { ipcs: true },
    });
    if (!contract) return { success: false, error: "Contract not found." };

    const previousCertified = contract.ipcs.reduce(
      (sum, ipc) => sum + Number(ipc.amountDue),
      0,
    );
    const certificate = ipcCertificate({
      grossAmount,
      previousCertified,
      retentionRate: optionalNumber(formData.get("retentionRate")),
      retentionAmount: optionalNumber(formData.get("retentionAmount")),
    });
    if (certificate.amountDue < 0) {
      return {
        success: false,
        error: "Gross to date cannot be less than retention plus previously certified work.",
      };
    }

    const ipc = await db.interimPaymentCertificate.create({
      data: {
        ipcNumber: reference("IPC"),
        contractId,
        certifiedById: user.id,
        periodStart,
        periodEnd,
        grossAmount: certificate.grossAmount,
        retention: certificate.retention,
        previousPaid: certificate.previousPaid,
        amountDue: certificate.amountDue,
        notes,
        status: "CERTIFIED",
      },
    });

    await syncProjectExpenditure(contract.projectId);
    revalidateConstruction(["/dashboard/contracts", `/dashboard/projects/${contract.projectId}`]);
    return { success: true, id: ipc.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not certify IPC." };
  }
}

export async function markIpcPaid(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "approve");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const ipcId = String(formData.get("ipcId") || "");
    if (!ipcId) return { success: false, error: "IPC is required." };
    const ipc = await db.interimPaymentCertificate.update({
      where: { id: ipcId },
      data: { status: "PAID" },
      include: { contract: true },
    });
    await syncProjectExpenditure(ipc.contract.projectId);
    revalidateConstruction(["/dashboard/contracts", `/dashboard/projects/${ipc.contract.projectId}`]);
    return { success: true, id: ipc.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not mark the IPC as paid." };
  }
}

export async function issueStockToProject(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("inventory", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const itemId = String(formData.get("itemId") || "");
    const projectId = String(formData.get("projectId") || "") || null;
    const quantity = Number(formData.get("quantity") || 0);
    const notes = String(formData.get("notes") || "") || null;
    if (!itemId || quantity <= 0) return { success: false, error: "Item and quantity are required." };

    await db.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item || Number(item.quantityOnHand) < quantity) {
        throw new Error("Insufficient stock");
      }
      await tx.stockTransaction.create({
        data: {
          itemId,
          projectId,
          type: "ISSUE",
          quantity,
          notes,
          reference: projectId ? `ISSUE-${projectId.slice(0, 6)}` : "ISSUE",
        },
      });
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantityOnHand: { decrement: quantity } },
      });
    });

    if (projectId) await syncProjectExpenditure(projectId);
    revalidateConstruction(["/dashboard/inventory", projectId ? `/dashboard/projects/${projectId}` : "/dashboard"].filter(Boolean));
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not issue materials from store." };
  }
}

export async function receiveStock(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("inventory", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const itemId = String(formData.get("itemId") || "");
    const projectId = String(formData.get("projectId") || "") || null;
    const quantity = Number(formData.get("quantity") || 0);
    const notes = String(formData.get("notes") || "") || null;
    if (!itemId || quantity <= 0) return { success: false, error: "Item and quantity are required." };

    await db.$transaction(async (tx) => {
      await tx.stockTransaction.create({
        data: {
          itemId,
          projectId: null,
          type: "RECEIPT",
          quantity,
          notes,
          reference: projectId ? `RCV-${projectId.slice(0, 6)}` : "RCV",
        },
      });
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantityOnHand: { increment: quantity } },
      });
      if (projectId) {
        await tx.stockTransaction.create({
          data: {
            itemId,
            projectId,
            type: "ISSUE",
            quantity,
            notes: notes ?? "Received and issued to site",
            reference: `ISSUE-${projectId.slice(0, 6)}`,
          },
        });
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: { quantityOnHand: { decrement: quantity } },
        });
      }
    });

    if (projectId) await syncProjectExpenditure(projectId);
    revalidateConstruction(["/dashboard/inventory"]);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not receive stock into stores." };
  }
}

export async function createInventoryItem(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("inventory", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const sku = String(formData.get("sku") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const unit = String(formData.get("unit") || "").trim() || "item";
    const category = String(formData.get("category") || "MATERIALS");
    if (!sku || !name) return { success: false, error: "SKU and name are required." };

    const warehouse = await db.warehouse.findFirst({ orderBy: { createdAt: "asc" } });
    const item = await db.inventoryItem.create({
      data: {
        sku,
        name,
        category,
        unit,
        quantityOnHand: optionalNumber(formData.get("quantityOnHand")) ?? 0,
        reorderLevel: optionalNumber(formData.get("reorderLevel")) ?? 0,
        unitCost: optionalNumber(formData.get("unitCost")),
        warehouseId: warehouse?.id,
      },
    });
    revalidatePath("/dashboard/inventory");
    return { success: true, id: item.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not add the store item. SKU must be unique." };
  }
}

export async function createProjectExpense(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const projectId = String(formData.get("projectId") || "");
    const description = String(formData.get("description") || "").trim();
    const amount = Number(formData.get("amount") || 0);
    if (!projectId || !description || amount <= 0) {
      return { success: false, error: "Project, description and amount are required." };
    }
    const expense = await db.expense.create({
      data: {
        projectId,
        description,
        amount,
        category: String(formData.get("category") || "MATERIALS"),
        expenseDate: optionalDate(formData.get("expenseDate")) ?? new Date(),
        currency: String(formData.get("currency") || "UGX"),
        status: "RECORDED",
      },
    });
    await syncProjectExpenditure(projectId);
    revalidateConstruction([`/dashboard/projects/${projectId}`, "/dashboard"]);
    return { success: true, id: expense.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not record the project expense." };
  }
}

export async function createContractor(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("contractors", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const name = String(formData.get("name") || "").trim();
    if (!name) return { success: false, error: "Subcontractor name is required." };
    const contractor = await db.contractor.create({
      data: {
        name,
        specialty: String(formData.get("specialty") || "") || null,
        email: String(formData.get("email") || "") || null,
        phone: String(formData.get("phone") || "") || null,
        address: String(formData.get("address") || "") || null,
      },
    });
    revalidatePath("/dashboard/contractors");
    return { success: true, id: contractor.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not register the subcontractor." };
  }
}

export async function createSupplier(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("suppliers", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const name = String(formData.get("name") || "").trim();
    if (!name) return { success: false, error: "Supplier name is required." };
    const supplier = await db.supplier.create({
      data: {
        name,
        email: String(formData.get("email") || "") || null,
        phone: String(formData.get("phone") || "") || null,
        address: String(formData.get("address") || "") || null,
        taxNumber: String(formData.get("taxNumber") || "") || null,
      },
    });
    revalidateConstruction(["/dashboard/suppliers", "/dashboard/procurement"]);
    return { success: true, id: supplier.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not register the supplier." };
  }
}

export async function deleteContractor(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("contractors", "edit");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const id = String(formData.get("id") || "");
    if (!id) return { success: false, error: "Contractor is required." };
    await db.contractor.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    revalidatePath("/dashboard/contractors");
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the subcontractor." };
  }
}

export async function deleteSupplier(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("suppliers", "edit");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const id = String(formData.get("id") || "");
    if (!id) return { success: false, error: "Supplier is required." };
    await db.supplier.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    revalidatePath("/dashboard/suppliers");
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the supplier." };
  }
}

export async function deleteEquipment(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("equipment", "edit");
  if (!user) return { success: false, error: "Forbidden" };
  try {
    const id = String(formData.get("id") || "");
    if (!id) return { success: false, error: "Equipment is required." };
    await db.equipment.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    revalidatePath("/dashboard/equipment");
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the equipment." };
  }
}

export async function createEquipment(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("equipment", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const name = String(formData.get("name") || "").trim();
    if (!name) return { success: false, error: "Equipment name is required." };
    const equipment = await db.equipment.create({
      data: {
        code: reference("EQ"),
        name,
        category: String(formData.get("category") || "") || null,
        condition: String(formData.get("condition") || "GOOD"),
        currentLocation: String(formData.get("currentLocation") || "") || null,
        nextServiceDate: optionalDate(formData.get("nextServiceDate")),
      },
    });
    revalidatePath("/dashboard/equipment");
    return { success: true, id: equipment.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not register the equipment." };
  }
}

export async function addSupplierQuotation(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("procurement", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const requestId = String(formData.get("requestId") || "");
    const supplierId = String(formData.get("supplierId") || "");
    const amount = Number(formData.get("amount") || 0);
    if (!requestId || !supplierId || amount <= 0) {
      return { success: false, error: "Request, supplier and amount are required." };
    }
    const quote = await db.supplierQuotation.create({
      data: {
        requestId,
        supplierId,
        amount,
        currency: String(formData.get("currency") || "UGX"),
        notes: String(formData.get("notes") || "") || null,
        validUntil: optionalDate(formData.get("validUntil")),
      },
    });
    await db.purchaseRequest.update({
      where: { id: requestId },
      data: { status: "QUOTING" },
    });
    revalidatePath("/dashboard/procurement");
    return { success: true, id: quote.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not add the supplier quotation." };
  }
}

export async function selectSupplierQuotation(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("procurement", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const quotationId = String(formData.get("quotationId") || "");
    if (!quotationId) return { success: false, error: "Quotation is required." };
    const quote = await db.supplierQuotation.findUnique({ where: { id: quotationId } });
    if (!quote) return { success: false, error: "Quotation not found." };

    await db.$transaction([
      db.supplierQuotation.updateMany({
        where: { requestId: quote.requestId },
        data: { isSelected: false },
      }),
      db.supplierQuotation.update({
        where: { id: quotationId },
        data: { isSelected: true },
      }),
      db.purchaseRequest.update({
        where: { id: quote.requestId },
        data: { status: "PENDING_APPROVAL" },
      }),
    ]);
    revalidatePath("/dashboard/procurement");
    return { success: true, id: quotationId };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not select the quotation." };
  }
}

export async function approvePurchaseRequest(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("procurement", "approve");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const requestId = String(formData.get("requestId") || "");
    if (!requestId) return { success: false, error: "Purchase request is required." };
    const request = await db.purchaseRequest.findUnique({
      where: { id: requestId },
      include: { quotations: true },
    });
    if (!request) return { success: false, error: "Request not found." };
    const selected = request.quotations.find((quote) => quote.isSelected) ?? request.quotations[0];
    if (!selected) return { success: false, error: "Add and select a supplier quotation first." };

    const order = await db.purchaseOrder.create({
      data: {
        orderNumber: reference("PO"),
        requestId,
        supplierId: selected.supplierId,
        totalAmount: selected.amount,
        currency: selected.currency,
        status: "ISSUED",
      },
    });
    await db.purchaseRequest.update({
      where: { id: requestId },
      data: { status: "ORDERED" },
    });
    await db.approval.create({
      data: {
        entityType: "PurchaseRequest",
        entityId: requestId,
        requestId,
        userId: user.id,
        decision: "APPROVED",
        comment: "Purchase order raised from selected supplier quotation.",
      },
    });
    revalidatePath("/dashboard/procurement");
    return { success: true, id: order.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not approve the purchase request." };
  }
}

export async function receivePurchaseOrder(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("inventory", "edit");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const orderId = String(formData.get("orderId") || "");
    const itemId = String(formData.get("itemId") || "");
    const quantity = Number(formData.get("quantity") || 0);
    const complete = String(formData.get("complete") || "") === "true";
    if (!orderId || !itemId || quantity <= 0) {
      return { success: false, error: "Purchase order, store item and quantity are required." };
    }

    const order = await db.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { request: true },
    });
    if (!order) return { success: false, error: "Purchase order not found." };
    const projectId = order.request?.projectId ?? null;
    const deliverToSite = String(formData.get("deliverToSite") || "") === "true" && Boolean(projectId);

    await db.$transaction(async (tx) => {
      await tx.goodsReceivedNote.create({
        data: {
          grnNumber: reference("GRN"),
          purchaseOrderId: orderId,
          receivedBy: user.id,
          notes: String(formData.get("notes") || "") || null,
        },
      });
      await tx.stockTransaction.create({
        data: {
          itemId,
          type: "RECEIPT",
          quantity,
          notes: "Received to store",
          reference: order.orderNumber,
        },
      });
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantityOnHand: { increment: quantity } },
      });
      if (deliverToSite && projectId) {
        await tx.stockTransaction.create({
          data: {
            itemId,
            projectId,
            type: "ISSUE",
            quantity,
            notes: "Received and issued to site",
            reference: order.orderNumber,
          },
        });
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: { quantityOnHand: { decrement: quantity } },
        });
      }
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: complete ? "RECEIVED" : "PARTIAL" },
      });
      if (order.requestId) {
        await tx.purchaseRequest.update({
          where: { id: order.requestId },
          data: { status: complete ? "RECEIVED" : "ORDERED" },
        });
      }
    });

    if (deliverToSite && projectId) await syncProjectExpenditure(projectId);
    revalidateConstruction(["/dashboard/procurement", "/dashboard/inventory"]);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not receive the purchase order into stores." };
  }
}
