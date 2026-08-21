/**
 * Assign unique primary images to seeded properties.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const IMAGES: Record<string, string> = {
  "kololo-executive-apartment": "/site-photos/site-04.jpeg",
  "naguru-family-house": "/site-photos/site-03.jpeg",
  "entebbe-lakefront-villa": "/site-photos/site-07.jpeg",
  "wakiso-commercial-shop": "/site-photos/site-08.jpeg",
  "jinja-riverside-plot": "/site-photos/site-09.jpeg",
  "bugolobi-serviced-apartments": "/site-photos/site-02.jpeg",
};

async function main() {
  for (const [slug, url] of Object.entries(IMAGES)) {
    const property = await db.property.findUnique({ where: { slug } });
    if (!property) {
      console.log(`Skip missing property: ${slug}`);
      continue;
    }

    await db.property.update({
      where: { id: property.id },
      data: { isPublished: true },
    });

    // Make Bugolobi featured too so homepage has more variety
    if (slug === "bugolobi-serviced-apartments") {
      await db.property.update({
        where: { id: property.id },
        data: { isFeatured: true },
      });
    }

    const primary = await db.propertyImage.findFirst({
      where: { propertyId: property.id, isPrimary: true },
    });

    if (primary) {
      await db.propertyImage.update({
        where: { id: primary.id },
        data: { url, alt: property.title },
      });
    } else {
      await db.propertyImage.create({
        data: {
          propertyId: property.id,
          url,
          alt: property.title,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
    console.log(`Updated image: ${slug}`);
  }

  const featured = await db.property.findMany({
    where: { isFeatured: true, isPublished: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { listedAt: "desc" },
  });
  console.log(
    "Featured:",
    featured.map((p) => ({
      slug: p.slug,
      image: p.images[0]?.url?.slice(0, 70),
    })),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
