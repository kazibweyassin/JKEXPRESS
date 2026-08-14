"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionResult } from "@/app/actions/leads";

const viewingSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).max(30),
  propertyId: z.string().min(1),
  scheduledAt: z.string().min(1),
  message: z.string().max(2000).optional(),
});

export async function submitViewingRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const raw = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      propertyId: String(formData.get("propertyId") ?? ""),
      scheduledAt: String(formData.get("scheduledAt") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const data = viewingSchema.parse(raw);
    const scheduledAt = new Date(data.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return {
        success: false,
        error: "Please choose a valid future date and time for your viewing.",
      };
    }

    const property = await db.property.findFirst({
      where: { id: data.propertyId, isPublished: true, deletedAt: null },
      select: { id: true, title: true, agentId: true },
    });

    if (!property) {
      return {
        success: false,
        error: "The selected property is not available for viewing.",
      };
    }

    const clientName = `${data.firstName} ${data.lastName}`.trim();

    await db.viewing.create({
      data: {
        propertyId: property.id,
        clientName,
        clientEmail: data.email || null,
        clientPhone: data.phone,
        scheduledAt,
        agentId: property.agentId,
        status: "SCHEDULED",
        feedback: data.message || null,
      },
    });

    // Also capture as a lead for sales follow-up
    const count = await db.lead.count();
    const reference = `LD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    await db.lead.create({
      data: {
        reference,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        message:
          data.message ||
          `Viewing requested for ${property.title} on ${scheduledAt.toISOString()}`,
        interest: "VIEWING",
        propertyId: property.id,
        source: "WEBSITE",
        stage: "NEW",
        activities: {
          create: {
            type: "NOTE",
            title: "Viewing requested via website",
            description: `Scheduled for ${scheduledAt.toLocaleString("en-UG", {
              timeZone: "Africa/Kampala",
            })}`,
          },
        },
      },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/book-viewing");

    return {
      success: true,
      message: `Your viewing for ${property.title} has been scheduled. Reference ${reference}.`,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: "Could not book your viewing. Please check the form and try again.",
    };
  }
}
