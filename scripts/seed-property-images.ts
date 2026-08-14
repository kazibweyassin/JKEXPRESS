/**
 * Assign unique primary images to seeded properties.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const IMAGES: Record<string, string> = {
  "kololo-executive-apartment":
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "naguru-family-house":
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "entebbe-lakefront-villa":
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  "wakiso-commercial-shop":
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  "jinja-riverside-plot":
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  "bugolobi-serviced-apartments":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
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
