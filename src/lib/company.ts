import { db } from "@/lib/db";

export const BRAND = {
  primaryColor: "#002090",
  secondaryColor: "#E80000",
  companyName: "JK Express",
  fullName: "JK Express Realtors & Developers Ltd.",
  phone: "0704 776 059 | 0786 953 313",
  whatsapp: "+256704776059",
  logoUrl: "/logo.png",
} as const;

export async function getCompanySettings() {
  const settings = await db.companySetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return (
    settings ?? {
      companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? BRAND.companyName,
      tagline: "Building Construction & Consultancy · Real Estate & Property Management",
      description: null as string | null,
      email: "info@jkexpress.ug",
      phone: BRAND.phone,
      whatsapp: BRAND.whatsapp,
      address: "Kampala, Uganda",
      city: "Kampala",
      country: "Uganda",
      defaultCurrency: "UGX",
      secondaryCurrency: "USD",
      primaryColor: BRAND.primaryColor,
      secondaryColor: BRAND.secondaryColor,
      logoUrl: BRAND.logoUrl as string | null,
      websiteUrl: null as string | null,
      facebookUrl: null as string | null,
      twitterUrl: null as string | null,
      linkedinUrl: null as string | null,
      instagramUrl: null as string | null,
    }
  );
}
