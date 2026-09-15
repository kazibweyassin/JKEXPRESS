"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DOCUMENT_MAX_BYTES,
  documentDisposition,
  documentExtension,
  documentKey,
} from "@/lib/document-upload";
import { hasPermission } from "@/lib/permissions";
import { deleteR2Images, r2KeyFromPublicUrl, uploadR2File } from "@/lib/r2-storage";

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

async function requireUser(
  resource: string,
  action: "create" | "edit" | "delete",
) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, resource, action)) {
    return null;
  }
  return session.user;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optional(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function optionalDate(formData: FormData, key: string) {
  const raw = text(formData, key);
  return raw ? new Date(raw) : undefined;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function reference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
}

function revalidate(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

export async function createEmployee(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("employees", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const name = text(formData, "name");
    const email = text(formData, "email").toLowerCase();
    const password = text(formData, "password");
    const roleId = text(formData, "roleId");
    if (!name || !email || !password || !roleId) {
      return { success: false, error: "Name, email, password and role are required." };
    }
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters." };
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "That email is already in use." };

    const user = await db.user.create({
      data: {
        name,
        email,
        phone: optional(formData, "phone"),
        passwordHash: await hash(password, 10),
        roleId,
        isActive: true,
        emailVerified: new Date(),
      },
    });
    const employee = await db.employee.create({
      data: {
        userId: user.id,
        employeeCode: reference("EMP"),
        departmentId: optional(formData, "departmentId"),
        jobTitle: optional(formData, "jobTitle"),
        employmentStatus: text(formData, "employmentStatus") || "ACTIVE",
        hireDate: optionalDate(formData, "hireDate"),
      },
    });
    revalidate(["/dashboard/employees"]);
    return { success: true, id: employee.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the employee." };
  }
}

export async function updateEmployee(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("employees", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Employee is required." };
    const roleId = optional(formData, "roleId");
    const employee = await db.employee.update({
      where: { id },
      data: {
        jobTitle: optional(formData, "jobTitle"),
        departmentId: optional(formData, "departmentId"),
        employmentStatus: text(formData, "employmentStatus") || "ACTIVE",
      },
    });
    await db.user.update({
      where: { id: employee.userId },
      data: {
        ...(roleId ? { roleId } : {}),
        isActive: (text(formData, "employmentStatus") || "ACTIVE") === "ACTIVE",
      },
    });
    revalidate(["/dashboard/employees"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the employee." };
  }
}

export async function deleteEmployee(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("employees", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Employee is required." };
    const employee = await db.employee.update({
      where: { id },
      data: { deletedAt: new Date(), employmentStatus: "INACTIVE" },
    });
    await db.user.update({
      where: { id: employee.userId },
      data: { isActive: false },
    });
    revalidate(["/dashboard/employees"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the employee." };
  }
}

function documentFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    throw new Error("Each document must be 25 MB or smaller.");
  }
  return file;
}

export async function createDocument(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("documents", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  let uploadedKey: string | null = null;
  try {
    const title = text(formData, "title");
    if (!title) return { success: false, error: "Title is required." };
    const file = documentFile(formData);
    const extension = documentExtension(file);
    const fileName = file.name || `${title}.${extension}`;
    uploadedKey = documentKey(randomUUID(), extension);
    const fileUrl = await uploadR2File(
      uploadedKey,
      new Uint8Array(await file.arrayBuffer()),
      file.type || "application/octet-stream",
      {
        cacheControl: "private, max-age=3600",
        contentDisposition: documentDisposition(fileName, extension),
      },
    );
    const document = await db.document.create({
      data: {
        title,
        fileUrl,
        fileName,
        fileSize: file.size,
        mimeType: file.type || null,
        category: text(formData, "category") || "GENERAL",
        description: optional(formData, "description"),
        propertyId: optional(formData, "propertyId"),
        projectId: optional(formData, "projectId"),
        uploadedById: actor.id,
      },
    });
    revalidate(["/dashboard/documents"]);
    return { success: true, id: document.id };
  } catch (error) {
    if (uploadedKey) await deleteR2Images([uploadedKey]).catch(() => undefined);
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not save the document.";
    if (/R2 storage is not configured/.test(message)) {
      return { success: false, error: "Cloudflare R2 is not configured. Add the R2 variables from .env.example." };
    }
    return { success: false, error: message };
  }
}

export async function deleteDocument(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("documents", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Document is required." };
    const document = await db.document.findUnique({ where: { id } });
    if (!document) return { success: false, error: "Document not found." };
    const key = r2KeyFromPublicUrl(document.fileUrl);
    if (key) await deleteR2Images([key]).catch(() => undefined);
    await db.document.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(["/dashboard/documents"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the document." };
  }
}

export async function createClient(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("clients", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const firstName = text(formData, "firstName");
    const lastName = text(formData, "lastName");
    if (!firstName || !lastName) return { success: false, error: "First and last name are required." };
    const contact = await db.contact.create({
      data: {
        type: text(formData, "type") || "CLIENT",
        firstName,
        lastName,
        email: optional(formData, "email"),
        phone: optional(formData, "phone"),
        company: optional(formData, "company"),
        city: optional(formData, "city"),
        address: optional(formData, "address"),
        notes: optional(formData, "notes"),
      },
    });
    revalidate(["/dashboard/clients"]);
    return { success: true, id: contact.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the client." };
  }
}

export async function deleteClient(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("clients", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Client is required." };
    await db.contact.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(["/dashboard/clients"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the client." };
  }
}

export async function createTenant(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("tenants", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const firstName = text(formData, "firstName");
    const lastName = text(formData, "lastName");
    if (!firstName || !lastName) return { success: false, error: "First and last name are required." };
    const tenant = await db.tenant.create({
      data: {
        firstName,
        lastName,
        email: optional(formData, "email"),
        phone: optional(formData, "phone"),
        idNumber: optional(formData, "idNumber"),
        nationality: optional(formData, "nationality") || "Ugandan",
        address: optional(formData, "address"),
      },
    });
    revalidate(["/dashboard/tenants"]);
    return { success: true, id: tenant.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the tenant." };
  }
}

export async function deleteTenant(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("tenants", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Tenant is required." };
    await db.tenant.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(["/dashboard/tenants"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the tenant." };
  }
}

export async function createUnit(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("units", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const propertyId = text(formData, "propertyId");
    const unitNumber = text(formData, "unitNumber");
    if (!propertyId || !unitNumber) {
      return { success: false, error: "Property and unit number are required." };
    }
    const unit = await db.unit.create({
      data: {
        propertyId,
        unitNumber,
        unitType: optional(formData, "unitType"),
        bedrooms: optionalNumber(formData, "bedrooms") ?? undefined,
        bathrooms: optionalNumber(formData, "bathrooms") ?? undefined,
        monthlyRent: optionalNumber(formData, "monthlyRent"),
        status: text(formData, "status") || "VACANT",
      },
    });
    revalidate(["/dashboard/units"]);
    return { success: true, id: unit.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the unit. Unit numbers must be unique on a property." };
  }
}

export async function updateUnitStatus(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("units", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    const status = text(formData, "status");
    if (!id || !status) return { success: false, error: "Unit and status are required." };
    await db.unit.update({ where: { id }, data: { status } });
    revalidate(["/dashboard/units"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the unit." };
  }
}

export async function deleteUnit(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("units", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Unit is required." };
    await db.unit.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(["/dashboard/units"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the unit." };
  }
}

export async function createLease(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leases", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const tenantId = text(formData, "tenantId");
    const unitId = text(formData, "unitId");
    const startDate = optionalDate(formData, "startDate");
    const endDate = optionalDate(formData, "endDate");
    const monthlyRent = optionalNumber(formData, "monthlyRent");
    if (!tenantId || !unitId || !startDate || !endDate || monthlyRent == null) {
      return { success: false, error: "Tenant, unit, dates and rent are required." };
    }
    const unit = await db.unit.findUnique({ where: { id: unitId } });
    if (!unit) return { success: false, error: "Unit not found." };
    const lease = await db.lease.create({
      data: {
        reference: reference("LS"),
        tenantId,
        unitId,
        propertyId: unit.propertyId,
        startDate,
        endDate,
        monthlyRent,
        deposit: optionalNumber(formData, "deposit") ?? 0,
        status: "ACTIVE",
      },
    });
    await db.unit.update({ where: { id: unitId }, data: { status: "OCCUPIED" } });
    revalidate(["/dashboard/leases", "/dashboard/units", "/dashboard/tenants"]);
    return { success: true, id: lease.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not create the lease." };
  }
}

export async function updateLeaseStatus(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leases", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    const status = text(formData, "status");
    if (!id || !status) return { success: false, error: "Lease and status are required." };
    const lease = await db.lease.update({ where: { id }, data: { status } });
    if (["EXPIRED", "TERMINATED"].includes(status)) {
      await db.unit.update({ where: { id: lease.unitId }, data: { status: "VACANT" } });
    }
    revalidate(["/dashboard/leases", "/dashboard/units"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the lease." };
  }
}

export async function deleteLease(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leases", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Lease is required." };
    const lease = await db.lease.update({
      where: { id },
      data: { deletedAt: new Date(), status: "TERMINATED" },
    });
    await db.unit.update({ where: { id: lease.unitId }, data: { status: "VACANT" } });
    revalidate(["/dashboard/leases", "/dashboard/units"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the lease." };
  }
}

export async function createInspection(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("inspections", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const propertyId = text(formData, "propertyId");
    if (!propertyId) return { success: false, error: "Property is required." };
    const inspection = await db.inspection.create({
      data: {
        propertyId,
        unitId: optional(formData, "unitId"),
        type: text(formData, "type") || "ROUTINE",
        scheduledAt: optionalDate(formData, "scheduledAt") ?? new Date(),
        notes: optional(formData, "notes"),
        inspectorId: actor.id,
        status: "SCHEDULED",
      },
    });
    revalidate(["/dashboard/inspections"]);
    return { success: true, id: inspection.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not schedule the inspection." };
  }
}

export async function completeInspection(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("inspections", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Inspection is required." };
    await db.inspection.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        overallRating: optional(formData, "overallRating"),
      },
    });
    revalidate(["/dashboard/inspections"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not complete the inspection." };
  }
}

export async function createDashboardLead(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leads", "create");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const firstName = text(formData, "firstName");
    const lastName = text(formData, "lastName");
    const phone = text(formData, "phone");
    if (!firstName || !lastName || !phone) {
      return { success: false, error: "Name and phone are required." };
    }
    const lead = await db.lead.create({
      data: {
        reference: reference("LD"),
        firstName,
        lastName,
        phone,
        email: optional(formData, "email"),
        source: text(formData, "source") || "WALK_IN",
        interest: optional(formData, "interest"),
        message: optional(formData, "message"),
        propertyId: optional(formData, "propertyId"),
        assigneeId: actor.id,
        createdById: actor.id,
        stage: "NEW",
      },
    });
    revalidate(["/dashboard/leads"]);
    return { success: true, id: lead.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not save the lead." };
  }
}

export async function deleteLead(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leads", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    if (!id) return { success: false, error: "Lead is required." };
    await db.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(["/dashboard/leads"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not remove the lead." };
  }
}

export async function setLeadStage(formData: FormData): Promise<ActionResult> {
  const actor = await requireUser("leads", "edit");
  if (!actor) return { success: false, error: "Forbidden" };

  try {
    const id = text(formData, "id");
    const stage = text(formData, "stage");
    if (!id || !stage) return { success: false, error: "Lead and stage are required." };
    await db.lead.update({ where: { id }, data: { stage } });
    revalidate(["/dashboard/leads"]);
    return { success: true, id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not update the lead." };
  }
}
