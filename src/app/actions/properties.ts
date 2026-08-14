"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  propertyType: z.string(),
  listingType: z.enum(["SALE", "RENT"]),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  price: z.coerce.number().positive(),
  currency: z.string().default("UGX"),
  bedrooms: z.coerce.number().int().optional(),
  bathrooms: z.coerce.number().int().optional(),
  parkingSpaces: z.coerce.number().int().optional(),
  propertySize: z.coerce.number().optional(),
  landSize: z.coerce.number().optional(),
  furnishingStatus: z.string().optional(),
  status: z.string().default("DRAFT"),
  isFeatured: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type ActionResult = { success: true; id?: string } | { success: false; error: string };

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "properties", "create")) {
    return { success: false, error: "Forbidden" };
  }

  try {
    const data = propertySchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      propertyType: formData.get("propertyType"),
      listingType: formData.get("listingType"),
      city: formData.get("city") || undefined,
      district: formData.get("district") || undefined,
      address: formData.get("address") || undefined,
      price: formData.get("price"),
      currency: formData.get("currency") || "UGX",
      bedrooms: formData.get("bedrooms") || undefined,
      bathrooms: formData.get("bathrooms") || undefined,
      parkingSpaces: formData.get("parkingSpaces") || undefined,
      propertySize: formData.get("propertySize") || undefined,
      landSize: formData.get("landSize") || undefined,
      furnishingStatus: formData.get("furnishingStatus") || undefined,
      status: formData.get("status") || "DRAFT",
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
    });

    const count = await db.property.count();
    const reference = `PROP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    let slug = slugify(data.title);
    const existing = await db.property.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${count + 1}`;

    const property = await db.property.create({
      data: {
        ...data,
        reference,
        slug,
        country: "Uganda",
        listedAt: data.isPublished ? new Date() : null,
        agentId: session.user.id,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entityType: "Property",
        entityId: property.id,
        newValues: { reference, title: data.title },
      },
    });

    revalidatePath("/dashboard/properties");
    revalidatePath("/properties");
    return { success: true, id: property.id };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create property." };
  }
}

export async function updatePropertyStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "properties", "edit")) {
    return { success: false, error: "Forbidden" };
  }

  await db.property.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard/properties");
  revalidatePath("/properties");
  return { success: true, id };
}
