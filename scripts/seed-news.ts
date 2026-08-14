/**
 * Upsert published news articles with cover images.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const articles = [
  {
    slug: "kampala-property-outlook-2025",
    title: "Kampala Property Market Outlook 2025",
    excerpt:
      "Key trends shaping residential and commercial real estate across Kampala’s growth corridors.",
    content: `Kampala continues to attract strong demand for quality residential units, mixed-use developments and professionally managed assets.

Investor interest remains focused on corridors with infrastructure access, security and end-user demand — including Kololo, Naguru, Bugolobi, Ntinda and the Entebbe road axis.

JK Express is expanding its construction and property management portfolio with disciplined delivery, transparent reporting and long-term asset care for owners and tenants.

What to watch in 2025:
• Serviced and multi-unit residential demand from professionals
• Mixed-use shells that combine retail with upper-floor living
• Professional property management as a differentiator for yields
• Construction quality and handover standards that protect resale value

Whether you are buying, building or outsourcing management, local expertise and clear site controls remain decisive.`,
    coverImage: "/site-photos/site-08.jpeg",
    publishedAt: new Date("2025-11-12"),
  },
  {
    slug: "safety-first-on-site",
    title: "Safety First: Our Site Standards",
    excerpt:
      "How JK Express protects workers, neighbours and clients on every active construction site.",
    content: `Every JK Express site follows a practical safety culture — not paperwork theatre.

Our baseline standards include:
• Mandatory PPE for all personnel and visitors
• Daily toolbox talks before high-risk activities
• Controlled access and clear signage at gates
• Incident reporting with corrective actions tracked
• Scaffolding, formwork and pour reviews before major pours

Safety protects people first. It also protects programme, quality and client reputation. A safe site is a productive site.

Clients receive progress updates that include site condition notes so ownership stays informed without micromanaging the works.`,
    coverImage: "/site-photos/site-14.jpeg",
    publishedAt: new Date("2025-09-03"),
  },
  {
    slug: "why-professional-property-management-matters",
    title: "Why Professional Property Management Matters",
    excerpt:
      "Occupancy, collections and maintenance determine real returns — not just purchase price.",
    content: `Buying a unit is only half the investment story. Day-to-day operations decide whether an asset performs.

Professional property management covers:
• Tenant sourcing and lease administration
• Rent collection and arrears follow-up
• Planned and reactive maintenance
• Transparent owner reporting
• Compliance with house rules and local requirements

JK Express runs property operations alongside construction capability, so owners benefit from one accountable partner — from handover through occupancy.

If your portfolio is growing across Kampala or secondary cities, centralised reporting and clear SLAs reduce stress and protect net operating income.`,
    coverImage: "/site-photos/site-05.jpeg",
    publishedAt: new Date("2026-01-20"),
  },
  {
    slug: "from-structure-to-handover-our-delivery-approach",
    title: "From Structure to Handover: Our Delivery Approach",
    excerpt:
      "How we move projects from foundation through finishes with milestone accountability.",
    content: `Construction success is rarely about a single dramatic pour. It is about sequenced control.

JK Express structures delivery around:
1. Design and BOQ clarity before mobilisation
2. Phase gates (foundation, structure, finishes, snagging)
3. Cost and change control with client visibility
4. Quality checks before handover packages are closed

Our public project pages show progress percentages and phases so stakeholders can see where a site stands. Internally, the same discipline feeds tasks, procurement and site reports.

If you are planning a residential block, commercial shell or estate phase, start with a clear brief and a partner who can report as well as build.`,
    coverImage: "/site-photos/site-01.jpeg",
    publishedAt: new Date("2026-03-08"),
  },
  {
    slug: "entebbe-and-jinja-corridors-to-watch",
    title: "Entebbe & Jinja: Corridors to Watch",
    excerpt:
      "Beyond central Kampala, airport and Nile-linked markets continue to offer selective opportunity.",
    content: `Not every investor needs a Kololo address. Selective demand is building along corridors with connectivity and lifestyle pull.

Entebbe benefits from airport access, residential estate demand and lakeside appeal. Jinja remains Eastern Uganda’s commercial anchor, with the Nile corridor supporting trade and tourism-adjacent activity.

JK Express projects in these markets focus on practical commercial shells and residential product matched to local end-users — not copy-paste luxury that ignores absorption.

As always, underwrite location, construction quality and exit options carefully. Corridor opportunity only works with disciplined delivery.`,
    coverImage: "/site-photos/site-07.jpeg",
    publishedAt: new Date("2026-05-15"),
  },
  {
    slug: "booking-a-site-visit-what-to-expect",
    title: "Booking a Site Visit: What to Expect",
    excerpt:
      "A short guide for clients who want to walk an active JK Express construction site.",
    content: `Site visits help clients see real progress — scaffolding, structure, workforce and site organisation — not just renderings.

What to expect:
• Visits are typically available Monday–Saturday, 8:00 AM – 5:00 PM
• PPE may be required; follow the site supervisor’s instructions
• You will walk agreed safe zones, not unrestricted work areas
• Bring questions on programme, finishes, variations and handover

You can book through our website (Book viewing / Request quote) or WhatsApp the team with the project name.

Coming prepared with drawings or a clear brief makes the conversation far more productive.`,
    coverImage: "/site-photos/site-02.jpeg",
    publishedAt: new Date("2026-06-02"),
  },
];

async function main() {
  for (const article of articles) {
    await db.newsArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        isPublished: true,
        publishedAt: article.publishedAt,
      },
      create: {
        ...article,
        isPublished: true,
      },
    });
    console.log(`Upserted news: ${article.slug}`);
  }
  const count = await db.newsArticle.count({ where: { isPublished: true } });
  console.log(`Published articles: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
