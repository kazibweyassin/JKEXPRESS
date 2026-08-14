"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasSessionPermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const publicLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(30),
  message: z.string().max(2000).optional(),
  interest: z.string().optional(),
  propertyId: z.string().optional(),
  source: z.string().default("WEBSITE"),
});

export type ActionResult = { success: true; message?: string } | { success: false; error: string };

export async function submitPublicLead(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const raw = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      interest: String(formData.get("interest") ?? "") || undefined,
      propertyId: String(formData.get("propertyId") ?? "") || undefined,
      source: String(formData.get("source") ?? "WEBSITE"),
    };

    const data = publicLeadSchema.parse(raw);
    const count = await db.lead.count();
    const reference = `LD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const lead = await db.lead.create({
      data: {
        reference,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        message: data.message || null,
        interest: data.interest,
        propertyId: data.propertyId,
        source: data.source,
        stage: "NEW",
        activities: {
          create: {
            type: "NOTE",
            title: "Lead submitted via website",
            description: data.message || "Public form submission",
          },
        },
      },
    });

    const salesUsers = await db.user.findMany({
      where: {
        isActive: true,
        role: { slug: { in: ["sales-agent", "sales-manager", "super-administrator"] } },
      },
      take: 5,
    });

    if (salesUsers.length) {
      await db.notification.createMany({
        data: salesUsers.map((u) => ({
          userId: u.id,
          type: "NEW_LEAD",
          title: "New website lead",
          message: `${data.firstName} ${data.lastName} submitted an inquiry (${reference}).`,
          link: `/dashboard/leads`,
        })),
      });
    }

    revalidatePath("/dashboard/leads");
    return { success: true, message: `Thank you. Your reference is ${lead.reference}.` };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Could not submit your request. Please check the form and try again." };
  }
}

export async function updateLeadStage(leadId: string, stage: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasSessionPermission(session, "leads", "edit")) {
    return { success: false, error: "Forbidden" };
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      stage,
      activities: {
        create: {
          type: "STATUS_CHANGE",
          title: `Stage changed to ${stage}`,
          userId: session.user.id,
        },
      },
    },
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function assignLead(leadId: string, assigneeId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "leads", "assign")) {
    return { success: false, error: "Forbidden" };
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      assigneeId,
      activities: {
        create: {
          type: "NOTE",
          title: "Lead assigned",
          userId: session.user.id,
        },
      },
    },
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}
