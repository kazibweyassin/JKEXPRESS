import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildLlmsTxt,
  listingSchemaType,
  pageMeta,
  PUBLIC_ROUTES,
} from "./seo";

describe("seo helpers", () => {
  it("builds absolute canonical URLs", () => {
    expect(absoluteUrl("/properties")).toBe(
      "https://jkexpress.ug/properties",
    );
    expect(absoluteUrl("https://images.unsplash.com/x")).toBe(
      "https://images.unsplash.com/x",
    );
  });

  it("maps listing types to schema.org types", () => {
    expect(listingSchemaType("APARTMENT")).toBe("Apartment");
    expect(listingSchemaType("HOUSE")).toBe("House");
    expect(listingSchemaType("LAND")).toBe("LandPlot");
    expect(listingSchemaType("COMMERCIAL")).toBe("Store");
  });

  it("includes canonical and Open Graph fields", () => {
    const meta = pageMeta({
      title: "Properties for Sale and Rent in Uganda",
      description: "Browse listings.",
      path: "/properties",
    });
    expect(meta.alternates?.canonical).toBe("https://jkexpress.ug/properties");
    expect(meta.openGraph?.url).toBe("https://jkexpress.ug/properties");
  });

  it("covers core public routes and writes an llms.txt brief", () => {
    expect(PUBLIC_ROUTES.some((route) => route.path === "/")).toBe(true);
    expect(PUBLIC_ROUTES.some((route) => route.path === "/properties")).toBe(
      true,
    );
    const txt = buildLlmsTxt(true);
    expect(txt).toContain("JK Express Realtors & Developers Ltd.");
    expect(txt).toContain("/properties/");
    expect(txt).toContain("/projects/");
    expect(txt).toContain("Notes for assistants");
  });
});
