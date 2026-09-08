"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mondayOf, padRef } from "@/lib/construction-standards";
import { hasPermission } from "@/lib/permissions";
import { parseQuotationFormData } from "@/lib/quotation-pdf";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function requireUser(
  resource: "projects" | "inventory" | "procurement",
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

    const year = new Date().getFullYear();
    const count = await db.clientQuotation.count();
    const quotationNumber = padRef("QT", year, count + 1);
    const projectId = String(formData.get("projectId") || "") || null;

    const quotation = await db.clientQuotation.create({
      data: {
        quotationNumber,
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

    revalidatePath("/dashboard/quotations");
    revalidatePath(`/dashboard/quotations/${quotation.id}/pdf`);
    return { success: true, id: quotation.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save quotation. Check the database connection." };
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
      });

    const report = await db.weeklyProgressReport.create({
      data: {
        projectId: parsed.projectId,
        weekStarting: mondayOf(new Date(parsed.weekStarting)),
        enteredById: user.id,
        contractorId: parsed.contractorId || null,
        progressPercent: parsed.progressPercent,
        workCompleted: parsed.workCompleted,
        labourOnSite: parsed.labourOnSite,
        materialsOnSite: parsed.materialsOnSite,
        delays: parsed.delays,
        safetyNotes: parsed.safetyNotes,
        nextWeekPlan: parsed.nextWeekPlan,
        weather: parsed.weather,
        status: "SUBMITTED",
      },
    });

    if (parsed.progressPercent != null) {
      await db.constructionProject.update({
        where: { id: parsed.projectId },
        data: { completionPercentage: parsed.progressPercent },
      });
    }

    revalidatePath("/dashboard/progress");
    revalidatePath(`/dashboard/projects/${parsed.projectId}`);
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
    const contractSum = formData.get("contractSum")
      ? Number(formData.get("contractSum"))
      : undefined;
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
    revalidatePath(`/dashboard/projects/${projectId}`);
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
    const contractSum = formData.get("contractSum")
      ? Number(formData.get("contractSum"))
      : undefined;
    const specText = String(formData.get("specifications") || "");
    if (!projectId || !title) return { success: false, error: "Project and title are required." };

    const year = new Date().getFullYear();
    const count = await db.constructionContract.count();
    const contractNumber = padRef("CON", year, count + 1);

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
        contractNumber,
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

export async function createIpc(formData: FormData): Promise<ActionResult> {
  const user = await requireUser("projects", "create");
  if (!user) return { success: false, error: "Forbidden" };

  try {
    const contractId = String(formData.get("contractId") || "");
    const grossAmount = Number(formData.get("grossAmount") || 0);
    const retention = Number(formData.get("retention") || 0);
    const previousPaid = Number(formData.get("previousPaid") || 0);
    const notes = String(formData.get("notes") || "") || null;
    if (!contractId || !grossAmount) return { success: false, error: "Contract and gross amount are required." };

    const year = new Date().getFullYear();
    const count = await db.interimPaymentCertificate.count();
    const ipcNumber = padRef("IPC", year, count + 1);
    const amountDue = grossAmount - retention - previousPaid;

    const ipc = await db.interimPaymentCertificate.create({
      data: {
        ipcNumber,
        contractId,
        certifiedById: user.id,
        grossAmount,
        retention,
        previousPaid,
        amountDue,
        notes,
        status: "CERTIFIED",
      },
    });

    revalidatePath("/dashboard/contracts");
    return { success: true, id: ipc.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not certify IPC." };
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

    revalidatePath("/dashboard/inventory");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not issue materials from store." };
  }
}
