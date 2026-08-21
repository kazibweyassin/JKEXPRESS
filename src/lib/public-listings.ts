/**
 * Public website listings from the local catalog.
 * Properties use Unsplash photos of finished homes/commercial space.
 * Projects use /public/site-photos construction photography.
 */

import { propertyGalleryImages } from "@/lib/property-images";

export type PublicProperty = {
  id: string;
  slug: string;
  reference: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  status: string;
  city: string;
  district: string;
  address: string;
  country: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  propertySize: number | null;
  landSize: number | null;
  latitude: number | null;
  longitude: number | null;
  isFeatured: boolean;
  listedAt: Date | null;
  images: { url: string }[];
  imageCount: number;
  amenities: { id: string; name: string }[];
  agent: { name: string; email: string | null; phone: string | null } | null;
};

export type PublicProject = {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  clientName: string | null;
  location: string | null;
  city: string | null;
  status: string;
  completionPercentage: number;
  contractValue: number | null;
  startDate: Date | null;
  expectedCompletion: Date | null;
  featuredImage: string | null;
  updatedAt: Date;
  phases: { id: string; name: string; status: string }[];
};

export type PropertyListQuery = {
  listingType?: string;
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  q?: string;
};

const DEMO_AGENT: PublicProperty["agent"] = {
  name: "Sarah Namuli",
  email: "sales@jkexpress.ug",
  phone: "+256704776059",
};

function amenity(propertyId: string, names: string[]) {
  return names.map((name, i) => ({ id: `${propertyId}-am-${i}`, name }));
}

function listing({
  amenityNames,
  agent,
  ...rest
}: Omit<
  PublicProperty,
  | "country"
  | "currency"
  | "status"
  | "latitude"
  | "longitude"
  | "agent"
  | "images"
  | "imageCount"
  | "amenities"
> & {
  amenityNames: string[];
  agent?: PublicProperty["agent"];
}): PublicProperty {
  const images = propertyGalleryImages(
    rest.id,
    4,
    [],
    rest.propertyType,
  ).map((url) => ({ url }));
  return {
    country: "Uganda",
    currency: "UGX",
    status: "AVAILABLE",
    latitude: null,
    longitude: null,
    agent: agent ?? DEMO_AGENT,
    images,
    imageCount: images.length,
    amenities: amenity(rest.id, amenityNames),
    ...rest,
  };
}

export const DEMO_PROPERTIES: PublicProperty[] = [
  listing({
    id: "prop-kololo-executive-apartment",
    slug: "kololo-executive-apartment",
    reference: "PROP-KLA-001",
    title: "Kololo Executive 3-Bedroom Apartment",
    description:
      "Premium furnished apartment in Kololo with modern finishes, secure parking and 24-hour security. Ideal for executives and expatriates.",
    propertyType: "APARTMENT",
    listingType: "RENT",
    city: "Kampala",
    district: "Kampala",
    address: "Upper Kololo Terrace",
    price: 3500000,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    propertySize: 180,
    landSize: null,
    isFeatured: true,
    listedAt: new Date("2025-11-01"),
    amenityNames: ["Parking", "Security", "Generator", "Wi-Fi", "Balcony"],
  }),
  listing({
    id: "prop-naguru-family-house",
    slug: "naguru-family-house",
    reference: "PROP-KLA-002",
    title: "Naguru Family House for Sale",
    description:
      "Spacious 4-bedroom house in Naguru with garden, staff quarters and perimeter wall.",
    propertyType: "HOUSE",
    listingType: "SALE",
    city: "Kampala",
    district: "Kampala",
    address: "Naguru Hill",
    price: 850000000,
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 3,
    propertySize: 260,
    landSize: 0.25,
    isFeatured: true,
    listedAt: new Date("2025-10-18"),
    amenityNames: ["Garden", "Staff quarters", "Parking", "Water tank"],
  }),
  listing({
    id: "prop-entebbe-lakefront-villa",
    slug: "entebbe-lakefront-villa",
    reference: "PROP-EBB-001",
    title: "Entebbe Lakefront Villa",
    description:
      "Stunning villa near Lake Victoria with private garden and modern kitchen.",
    propertyType: "HOUSE",
    listingType: "SALE",
    city: "Entebbe",
    district: "Wakiso",
    address: "Nakiwogo Road",
    price: 1200000000,
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 4,
    propertySize: 420,
    landSize: 0.5,
    isFeatured: true,
    listedAt: new Date("2025-09-22"),
    amenityNames: ["Lake view", "Garden", "Security", "Borehole"],
  }),
  listing({
    id: "prop-wakiso-commercial-shop",
    slug: "wakiso-commercial-shop",
    reference: "PROP-WKS-001",
    title: "Wakiso Commercial Shop Unit",
    description: "High-traffic commercial unit suitable for retail or services.",
    propertyType: "COMMERCIAL",
    listingType: "RENT",
    city: "Wakiso",
    district: "Wakiso",
    address: "Gayaza Road",
    price: 1200000,
    bedrooms: null,
    bathrooms: 1,
    parkingSpaces: 2,
    propertySize: 45,
    landSize: null,
    isFeatured: false,
    listedAt: new Date("2025-08-30"),
    amenityNames: ["Parking", "Storage"],
  }),
  listing({
    id: "prop-jinja-riverside-plot",
    slug: "jinja-riverside-plot",
    reference: "PROP-JJA-001",
    title: "Jinja Riverside Land Plot",
    description:
      "Prime freehold land near the Nile, suitable for residential development.",
    propertyType: "LAND",
    listingType: "SALE",
    city: "Jinja",
    district: "Jinja",
    address: "Nile Crescent",
    price: 280000000,
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    propertySize: null,
    landSize: 1.2,
    isFeatured: true,
    listedAt: new Date("2025-07-12"),
    amenityNames: ["Road access", "Title available"],
  }),
  listing({
    id: "prop-bugolobi-serviced-apartments",
    slug: "bugolobi-serviced-apartments",
    reference: "PROP-KLA-003",
    title: "Bugolobi Serviced Apartments Block",
    description:
      "Managed apartment block with 8 units. Strong rental demand in Bugolobi.",
    propertyType: "APARTMENT",
    listingType: "RENT",
    city: "Kampala",
    district: "Kampala",
    address: "Luthuli Avenue, Bugolobi",
    price: 1800000,
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    propertySize: 95,
    landSize: null,
    isFeatured: true,
    listedAt: new Date("2025-11-20"),
    amenityNames: ["Parking", "Security", "Backup power", "Water"],
  }),
];

export const DEMO_PROJECTS: PublicProject[] = [
  {
    id: "prj-kololo-office-complex",
    slug: "kololo-office-complex",
    code: "PRJ-2025-001",
    name: "Kololo Office Complex",
    description:
      "5-storey mixed-use office complex with basement parking in Kololo, Kampala.",
    clientName: "Horizon Investments Ltd",
    location: "Kololo, Kampala",
    city: "Kampala",
    status: "ACTIVE",
    completionPercentage: 35,
    contractValue: 12500000000,
    startDate: new Date("2025-01-15"),
    expectedCompletion: new Date("2026-12-31"),
    featuredImage: "/site-photos/site-01.jpeg",
    updatedAt: new Date("2026-04-01"),
    phases: [
      { id: "phase-kololo-1", name: "Foundation", status: "COMPLETED" },
      { id: "phase-kololo-2", name: "Structure", status: "IN_PROGRESS" },
      { id: "phase-kololo-3", name: "Finishes", status: "NOT_STARTED" },
    ],
  },
  {
    id: "prj-entebbe-residential-estate",
    slug: "entebbe-residential-estate",
    code: "PRJ-2024-008",
    name: "Entebbe Residential Estate Phase 1",
    description:
      "12-unit residential estate completed in Entebbe with landscaped courtyards and secure perimeter.",
    clientName: "JK Express Developments",
    location: "Entebbe Road corridor, Entebbe",
    city: "Entebbe",
    status: "COMPLETED",
    completionPercentage: 100,
    contractValue: 4800000000,
    startDate: new Date("2023-04-01"),
    expectedCompletion: new Date("2024-11-30"),
    featuredImage: "/site-photos/site-05.jpeg",
    updatedAt: new Date("2024-11-20"),
    phases: [
      { id: "phase-ebb-1", name: "Foundation", status: "COMPLETED" },
      { id: "phase-ebb-2", name: "Structure", status: "COMPLETED" },
      { id: "phase-ebb-3", name: "Handover", status: "COMPLETED" },
    ],
  },
  {
    id: "prj-naguru-hillside-apartments",
    slug: "naguru-hillside-apartments",
    code: "PRJ-2025-012",
    name: "Naguru Hillside Apartments",
    description:
      "4-storey apartment block with 16 units, panoramic hill views and basement services in Naguru, Kampala.",
    clientName: "Summit Homes Ltd",
    location: "Naguru, Kampala",
    city: "Kampala",
    status: "ACTIVE",
    completionPercentage: 48,
    contractValue: 7200000000,
    startDate: new Date("2025-03-01"),
    expectedCompletion: new Date("2026-09-30"),
    featuredImage: "/site-photos/site-02.jpeg",
    updatedAt: new Date("2026-03-15"),
    phases: [],
  },
  {
    id: "prj-bugolobi-mixed-use-hub",
    slug: "bugolobi-mixed-use-hub",
    code: "PRJ-2025-018",
    name: "Bugolobi Mixed-Use Hub",
    description:
      "Ground-floor retail with upper-level offices and apartments along the Bugolobi commercial strip.",
    clientName: "Lakeside Property Group",
    location: "Bugolobi, Kampala",
    city: "Kampala",
    status: "ACTIVE",
    completionPercentage: 22,
    contractValue: 9800000000,
    startDate: new Date("2025-02-10"),
    expectedCompletion: new Date("2027-01-31"),
    featuredImage: "/site-photos/site-08.jpeg",
    updatedAt: new Date("2026-02-01"),
    phases: [],
  },
  {
    id: "prj-muyenga-luxury-villas",
    slug: "muyenga-luxury-villas",
    code: "PRJ-2024-021",
    name: "Muyenga Luxury Villas",
    description:
      "Six detached luxury villas with high finishes, compound parking and servant quarters in Muyenga.",
    clientName: "Private client consortium",
    location: "Muyenga, Kampala",
    city: "Kampala",
    status: "COMPLETED",
    completionPercentage: 100,
    contractValue: 6100000000,
    startDate: new Date("2023-09-01"),
    expectedCompletion: new Date("2025-06-30"),
    featuredImage: "/site-photos/site-03.jpeg",
    updatedAt: new Date("2025-06-12"),
    phases: [],
  },
  {
    id: "prj-jinja-riverside-commercial",
    slug: "jinja-riverside-commercial",
    code: "PRJ-2025-027",
    name: "Jinja Riverside Commercial Block",
    description:
      "Three-storey commercial block near the Nile corridor with flexible retail shells and first-floor offices.",
    clientName: "Eastern Trade Holdings",
    location: "Main Street corridor, Jinja",
    city: "Jinja",
    status: "ACTIVE",
    completionPercentage: 28,
    contractValue: 3500000000,
    startDate: new Date("2025-05-01"),
    expectedCompletion: new Date("2026-08-15"),
    featuredImage: "/site-photos/site-07.jpeg",
    updatedAt: new Date("2026-01-20"),
    phases: [],
  },
];

function hasActiveFilters(filters?: PropertyListQuery) {
  if (!filters) return false;
  return Boolean(
    filters.listingType ||
      filters.city ||
      filters.propertyType ||
      filters.bedrooms ||
      filters.q,
  );
}

export function filterProperties(
  properties: PublicProperty[],
  filters?: PropertyListQuery,
): PublicProperty[] {
  if (!filters || !hasActiveFilters(filters)) return properties;
  const city = filters.city?.toLowerCase();
  const q = filters.q?.trim().toLowerCase();
  return properties.filter((property) => {
    if (filters.listingType && property.listingType !== filters.listingType) {
      return false;
    }
    if (filters.propertyType && property.propertyType !== filters.propertyType) {
      return false;
    }
    if (city && !property.city.toLowerCase().includes(city)) return false;
    if (
      filters.bedrooms &&
      (property.bedrooms == null || property.bedrooms < filters.bedrooms)
    ) {
      return false;
    }
    if (q) {
      const haystack = `${property.title} ${property.description} ${property.address}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function listPublishedProperties(
  filters?: PropertyListQuery,
): Promise<PublicProperty[]> {
  return filterProperties(DEMO_PROPERTIES, filters);
}

export async function getFeaturedProperties(take = 6): Promise<PublicProperty[]> {
  const all = await listPublishedProperties();
  const featured = all.filter((property) => property.isFeatured);
  return (featured.length ? featured : all).slice(0, take);
}

export async function getPropertyBySlug(
  slug: string,
): Promise<PublicProperty | null> {
  return DEMO_PROPERTIES.find((property) => property.slug === slug) ?? null;
}

export async function getPropertyById(
  id: string,
): Promise<PublicProperty | null> {
  return (
    DEMO_PROPERTIES.find(
      (property) => property.id === id || property.slug === id,
    ) ?? null
  );
}

export async function getSimilarProperties(
  property: PublicProperty,
  take = 3,
): Promise<PublicProperty[]> {
  const all = await listPublishedProperties();
  return all
    .filter(
      (item) =>
        item.id !== property.id &&
        (item.city === property.city ||
          item.propertyType === property.propertyType ||
          item.listingType === property.listingType),
    )
    .slice(0, take);
}

export async function listPublishedProjects(): Promise<PublicProject[]> {
  return DEMO_PROJECTS;
}

export async function getProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  return DEMO_PROJECTS.find((project) => project.slug === slug) ?? null;
}

export async function getPublicStats() {
  return {
    propertyCount: DEMO_PROPERTIES.length,
    completedProjects: DEMO_PROJECTS.filter((p) => p.status === "COMPLETED")
      .length,
    occupiedUnits: 0,
    activeLeases: 0,
  };
}
