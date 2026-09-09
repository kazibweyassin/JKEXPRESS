"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { slugify } from "@/lib/utils";
import { deleteR2Images, uploadR2Image } from "@/lib/r2-storage";

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

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxImageSize = 5 * 1024 * 1024;

function propertyImages(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 8) throw new Error("Upload a maximum of 8 property images.");
  for (const file of files) {
    if (!imageTypes.has(file.type)) throw new Error("Images must be JPEG, PNG or WebP files.");
    if (file.size > maxImageSize) throw new Error("Each property image must be 5 MB or smaller.");
  }
  return files;
}

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "properties", "create")) {
    return { success: false, error: "Forbidden" };
  }

  try {
    const images = propertyImages(formData);
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

    // JWT sessions can outlive a database reset or originate from offline auth.
    // Resolve the session to a current database user before using it as a FK.
    const sessionEmail = session.user.email?.trim().toLowerCase();
    const databaseAgent = await db.user.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { id: session.user.id },
          ...(sessionEmail ? [{ email: sessionEmail }] : []),
        ],
      },
      select: { id: true },
    });

    const property = await db.property.create({
      data: {
        ...data,
        reference,
        slug,
        country: "Uganda",
        listedAt: data.isPublished ? new Date() : null,
        agentId: databaseAgent?.id ?? null,
      },
    });

    if (images.length > 0) {
      const uploadedKeys: string[] = [];
      try {
        const storedImages = [];
        for (const [index, image] of images.entries()) {
          const extension = imageTypes.get(image.type)!;
          const key = `properties/${property.id}/${randomUUID()}.${extension}`;
          const url = await uploadR2Image(key, new Uint8Array(await image.arrayBuffer()), image.type);
          uploadedKeys.push(key);
          storedImages.push({ propertyId: property.id, url, alt: `${data.title} image ${index + 1}`, sortOrder: index, isPrimary: index === 0 });
        }
        await db.propertyImage.createMany({ data: storedImages });
      } catch (uploadError) {
        await deleteR2Images(uploadedKeys).catch(() => undefined);
        await db.property.delete({ where: { id: property.id } }).catch(() => undefined);
        throw uploadError;
      }
    }

    try {
      await db.auditLog.create({
        data: {
          userId: databaseAgent?.id ?? null,
          action: "CREATE",
          entityType: "Property",
          entityId: property.id,
          newValues: { reference, title: data.title },
        },
      });
    } catch {
      // Audit logging must not turn a successful property creation into a failure.
    }

    revalidatePath("/dashboard/properties");
    revalidatePath("/properties");
    return { success: true, id: property.id };
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.startsWith("Upload")) return { success: false, error: e.message };
    if (e instanceof Error && e.message.startsWith("Images must")) return { success: false, error: e.message };
    if (e instanceof Error && e.message.startsWith("Each property image")) return { success: false, error: e.message };
    if (e instanceof Error && e.message.startsWith("R2 storage")) return { success: false, error: e.message };
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
