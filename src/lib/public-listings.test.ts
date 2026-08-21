import { describe, expect, it } from "vitest";
import { shouldSkipDatabase } from "./db-available";
import { propertyCoverImage, propertyGalleryImages } from "./property-images";
import {
  DEMO_PROJECTS,
  DEMO_PROPERTIES,
  filterProperties,
} from "./public-listings";
import { isLocalPublicPath } from "./site-photos";

describe("local listing catalog", () => {
  it("uses Unsplash photos for finished property covers", () => {
    const cover = propertyCoverImage("kololo", "APARTMENT");
    expect(cover.startsWith("https://images.unsplash.com/")).toBe(true);
    expect(cover.includes("site-photos")).toBe(false);
  });

  it("keeps Unsplash photos and ignores construction site shots", () => {
    const remote =
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80";
    expect(propertyCoverImage("kololo", "APARTMENT", remote)).toBe(remote);
    expect(
      propertyCoverImage(
        "kololo",
        "APARTMENT",
        "/site-photos/site-04.jpeg",
      ).startsWith("https://images.unsplash.com/"),
    ).toBe(true);
  });

  it("builds an Unsplash photo gallery for listings", () => {
    const gallery = propertyGalleryImages("naguru", 4, [], "HOUSE");
    expect(gallery).toHaveLength(4);
    expect(
      gallery.every((src) => src.startsWith("https://images.unsplash.com/")),
    ).toBe(true);
  });

  it("uses Unsplash for properties and local site photos for projects", () => {
    expect(DEMO_PROPERTIES).toHaveLength(6);
    expect(DEMO_PROJECTS).toHaveLength(6);
    expect(
      DEMO_PROPERTIES.every((property) =>
        property.images.every((image) =>
          image.url.startsWith("https://images.unsplash.com/"),
        ),
      ),
    ).toBe(true);
    expect(
      DEMO_PROJECTS.every((project) => isLocalPublicPath(project.featuredImage)),
    ).toBe(true);
  });

  it("skips the database unless listings are explicitly forced", () => {
    expect(
      shouldSkipDatabase(
        "postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require",
      ),
    ).toBe(true);
    expect(
      shouldSkipDatabase(
        "postgresql://postgres:postgres@localhost:5432/jkexpress",
      ),
    ).toBe(true);
    expect(
      shouldSkipDatabase(
        "postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require",
        "true",
      ),
    ).toBe(false);
  });

  it("filters catalog listings like the properties page", () => {
    const forSale = filterProperties(DEMO_PROPERTIES, { listingType: "SALE" });
    expect(forSale.every((p) => p.listingType === "SALE")).toBe(true);
    expect(forSale.length).toBeGreaterThan(0);

    const kampala = filterProperties(DEMO_PROPERTIES, { city: "Kampala" });
    expect(kampala.every((p) => p.city === "Kampala")).toBe(true);

    const beds = filterProperties(DEMO_PROPERTIES, { bedrooms: 4 });
    expect(beds.every((p) => (p.bedrooms ?? 0) >= 4)).toBe(true);
  });
});
