import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const existing = await db.companySetting.findFirst();
  if (!existing) {
    console.log("No company settings found");
    return;
  }
  await db.companySetting.update({
    where: { id: existing.id },
    data: {
      companyName: "JK Express",
      tagline:
        "Building Construction & Consultancy · Real Estate & Property Management",
      phone: "0704 776 059 | 0786 953 313",
      whatsapp: "+256704776059",
      primaryColor: "#002090",
      secondaryColor: "#E80000",
      logoUrl: "/logo.png",
    },
  });
  console.log("Brand settings updated");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
