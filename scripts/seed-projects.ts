/**
 * Upsert the public construction portfolio (6 projects) without full DB reseed.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const projects = [
  {
    code: "PRJ-2025-001",
    slug: "kololo-office-complex",
    name: "Kololo Office Complex",
    description:
      "5-storey mixed-use office complex with basement parking in Kololo, Kampala.",
    clientName: "Horizon Investments Ltd",
    location: "Kololo, Kampala",
    city: "Kampala",
    startDate: new Date("2025-01-15"),
    expectedCompletion: new Date("2026-12-31"),
    actualCompletion: null as Date | null,
    contractValue: 12500000000,
    approvedBudget: 11800000000,
    currentExpenditure: 4200000000,
    completionPercentage: 35,
    status: "ACTIVE",
    featuredImage: "/site-photos/site-01.jpeg",
  },
  {
    code: "PRJ-2024-008",
    slug: "entebbe-residential-estate",
    name: "Entebbe Residential Estate Phase 1",
    description:
      "12-unit residential estate completed in Entebbe with landscaped courtyards and secure perimeter.",
    clientName: "JK Express Developments",
    location: "Entebbe Road corridor, Entebbe",
    city: "Entebbe",
    startDate: new Date("2023-04-01"),
    expectedCompletion: new Date("2024-11-30"),
    actualCompletion: new Date("2024-11-20"),
    contractValue: 4800000000,
    approvedBudget: 4500000000,
    currentExpenditure: 4450000000,
    completionPercentage: 100,
    status: "COMPLETED",
    featuredImage: "/site-photos/site-05.jpeg",
  },
  {
    code: "PRJ-2025-012",
    slug: "naguru-hillside-apartments",
    name: "Naguru Hillside Apartments",
    description:
      "4-storey apartment block with 16 units, panoramic hill views and basement services in Naguru, Kampala.",
    clientName: "Summit Homes Ltd",
    location: "Naguru, Kampala",
    city: "Kampala",
    startDate: new Date("2025-03-01"),
    expectedCompletion: new Date("2026-09-30"),
    actualCompletion: null as Date | null,
    contractValue: 7200000000,
    approvedBudget: 6900000000,
    currentExpenditure: 2800000000,
    completionPercentage: 48,
    status: "ACTIVE",
    featuredImage: "/site-photos/site-02.jpeg",
  },
  {
    code: "PRJ-2025-018",
    slug: "bugolobi-mixed-use-hub",
    name: "Bugolobi Mixed-Use Hub",
    description:
      "Ground-floor retail with upper-level offices and apartments along the Bugolobi commercial strip.",
    clientName: "Lakeside Property Group",
    location: "Bugolobi, Kampala",
    city: "Kampala",
    startDate: new Date("2025-02-10"),
    expectedCompletion: new Date("2027-01-31"),
    actualCompletion: null as Date | null,
    contractValue: 9800000000,
    approvedBudget: 9400000000,
    currentExpenditure: 2100000000,
    completionPercentage: 22,
    status: "ACTIVE",
    featuredImage: "/site-photos/site-08.jpeg",
  },
  {
    code: "PRJ-2024-021",
    slug: "muyenga-luxury-villas",
    name: "Muyenga Luxury Villas",
    description:
      "Six detached luxury villas with high finishes, compound parking and servant quarters in Muyenga.",
    clientName: "Private client consortium",
    location: "Muyenga, Kampala",
    city: "Kampala",
    startDate: new Date("2023-09-01"),
    expectedCompletion: new Date("2025-06-30"),
    actualCompletion: new Date("2025-06-12"),
    contractValue: 6100000000,
    approvedBudget: 5900000000,
    currentExpenditure: 5850000000,
    completionPercentage: 100,
    status: "COMPLETED",
    featuredImage: "/site-photos/site-03.jpeg",
  },
  {
    code: "PRJ-2025-027",
    slug: "jinja-riverside-commercial",
    name: "Jinja Riverside Commercial Block",
    description:
      "Three-storey commercial block near the Nile corridor with flexible retail shells and first-floor offices.",
    clientName: "Eastern Trade Holdings",
    location: "Main Street corridor, Jinja",
    city: "Jinja",
    startDate: new Date("2025-05-01"),
    expectedCompletion: new Date("2026-08-15"),
    actualCompletion: null as Date | null,
    contractValue: 3500000000,
    approvedBudget: 3300000000,
    currentExpenditure: 900000000,
    completionPercentage: 28,
    status: "ACTIVE",
    featuredImage: "/site-photos/site-07.jpeg",
  },
];

async function main() {
  for (const item of projects) {
    await db.constructionProject.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        clientName: item.clientName,
        location: item.location,
        city: item.city,
        startDate: item.startDate,
        expectedCompletion: item.expectedCompletion,
        actualCompletion: item.actualCompletion,
        contractValue: item.contractValue,
        approvedBudget: item.approvedBudget,
        currentExpenditure: item.currentExpenditure,
        completionPercentage: item.completionPercentage,
        status: item.status,
        isPublished: true,
        featuredImage: item.featuredImage,
      },
      create: {
        ...item,
        isPublished: true,
      },
    });
    console.log(`Upserted ${item.code} — ${item.name}`);
  }
  const count = await db.constructionProject.count({
    where: { isPublished: true, deletedAt: null },
  });
  console.log(`Published projects: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
