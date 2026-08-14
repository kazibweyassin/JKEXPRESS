"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  defaultCurrency: z.string().default("UGX"),
  secondaryCurrency: z.string().default("USD"),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  websiteUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
});

export async function updateCompanySettings(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "settings", "edit")) {
    throw new Error("Forbidden");
  }

  const data = settingsSchema.parse({
    companyName: formData.get("companyName"),
    tagline: formData.get("tagline") || undefined,
    description: formData.get("description") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    defaultCurrency: formData.get("defaultCurrency") || "UGX",
    secondaryCurrency: formData.get("secondaryCurrency") || "USD",
    primaryColor: formData.get("primaryColor") || undefined,
    secondaryColor: formData.get("secondaryColor") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    facebookUrl: formData.get("facebookUrl") || undefined,
    twitterUrl: formData.get("twitterUrl") || undefined,
    linkedinUrl: formData.get("linkedinUrl") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
  });

  const existing = await db.companySetting.findFirst();
  if (existing) {
    await db.companySetting.update({ where: { id: existing.id }, data });
  } else {
    await db.companySetting.create({ data });
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entityType: "CompanySetting",
      entityId: existing?.id,
      newValues: data,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
}
