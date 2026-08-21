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
  it("uses public site photos for property covers", () => {
    const cover = propertyCoverImage("kololo", "APARTMENT");
    expect(isLocalPublicPath(cover)).toBe(true);
    expect(cover.startsWith("/site-photos/")).toBe(true);
  });

  it("ignores remote stock photos and keeps local paths", () => {
    const remote =
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688";
    const cover = propertyCoverImage("kololo", "APARTMENT", remote);
    expect(cover.startsWith("/site-photos/")).toBe(true);
    expect(
      propertyCoverImage("kololo", "APARTMENT", "/site-photos/site-04.jpeg"),
    ).toBe("/site-photos/site-04.jpeg");
  });

  it("builds a local photo gallery", () => {
    const gallery = propertyGalleryImages("naguru", 4);
    expect(gallery).toHaveLength(4);
    expect(gallery.every((src) => src.startsWith("/site-photos/"))).toBe(true);
  });

  it("has published demo properties and projects with local images", () => {
    expect(DEMO_PROPERTIES).toHaveLength(6);
    expect(DEMO_PROJECTS).toHaveLength(6);
    expect(
      DEMO_PROPERTIES.every((property) =>
        property.images.every((image) => isLocalPublicPath(image.url)),
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
