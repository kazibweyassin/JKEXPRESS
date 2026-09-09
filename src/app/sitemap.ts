import type { MetadataRoute } from "next";
import { DEMO_PROJECTS, DEMO_PROPERTIES } from "@/lib/public-listings";
import { CONSTRUCTION_SERVICES } from "@/lib/construction-services";
import { PUBLIC_ROUTES, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const property of DEMO_PROPERTIES) {
    pages.push({
      url: absoluteUrl(`/properties/${property.slug}`),
      lastModified: property.listedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const project of DEMO_PROJECTS) {
    pages.push({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const service of CONSTRUCTION_SERVICES) {
    pages.push({
      url: absoluteUrl(`/services/construction/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return pages;
}
