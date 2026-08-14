"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

const ticketSchema = z.object({
  propertyId: z.string().min(1),
  unitId: z.string().optional(),
  category: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.string().default("NORMAL"),
});

export type ActionResult = { success: true; ticketNumber?: string } | { success: false; error: string };

export async function createMaintenanceTicket(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (
    !session?.user ||
    (!hasPermission(session.user.permissions, "maintenance", "create") &&
      session.user.role.slug !== "tenant")
  ) {
    throw new Error("Forbidden");
  }

  const data = ticketSchema.parse({
    propertyId: formData.get("propertyId"),
    unitId: formData.get("unitId") || undefined,
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority") || "NORMAL",
  });

  const count = await db.maintenanceTicket.count();
  const ticketNumber = `MT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  let tenantId: string | undefined;
  if (session.user.role.slug === "tenant") {
    const tenant = await db.tenant.findUnique({ where: { userId: session.user.id } });
    tenantId = tenant?.id;
  }

  await db.maintenanceTicket.create({
    data: {
      ticketNumber,
      propertyId: data.propertyId,
      unitId: data.unitId,
      tenantId,
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "REPORTED",
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/portal/tenant");
}

export async function updateMaintenanceStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "maintenance", "edit")) {
    return { success: false, error: "Forbidden" };
  }

  await db.maintenanceTicket.update({
    where: { id },
    data: {
      status,
      completedAt: status === "COMPLETED" || status === "CLOSED" ? new Date() : undefined,
      updates: {
        create: {
          note: `Status updated to ${status}`,
          status,
          createdBy: session.user.id,
        },
      },
    },
  });

  revalidatePath("/dashboard/maintenance");
  return { success: true };
}
