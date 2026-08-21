import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/ui/page-hero";
import { PropertyCard } from "@/components/ui/property-card";
import { Select } from "@/components/ui/select";
import { listPublishedProperties } from "@/lib/public-listings";
import { cn } from "@/lib/utils";

export const metadata = { title: "Properties" };

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    listingType?: string;
    city?: string;
    propertyType?: string;
    bedrooms?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const bedrooms = params.bedrooms ? Number(params.bedrooms) : undefined;

  const properties = await listPublishedProperties({
    listingType: params.listingType,
    city: params.city,
    propertyType: params.propertyType,
    bedrooms,
    q: params.q,
  });

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1.5 text-sm font-medium transition",
      active
        ? "bg-navy-900 text-white"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-navy-50 hover:text-navy-900",
    );

  return (
    <div>
      <PageHero
        eyebrow="Listings"
        title="Properties for sale and rent"
        description="Homes, land and commercial spaces across Uganda."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/properties" className={chipClass(!params.listingType)}>
            All
          </Link>
          <Link
            href="/properties?listingType=SALE"
            className={chipClass(params.listingType === "SALE")}
          >
            For sale
          </Link>
          <Link
            href="/properties?listingType=RENT"
            className={chipClass(params.listingType === "RENT")}
          >
            For rent
          </Link>
        </div>

        <form className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
          {params.listingType ? (
            <input type="hidden" name="listingType" value={params.listingType} />
          ) : null}
          <Input
            name="q"
            placeholder="Search area or title..."
            defaultValue={params.q}
            className="lg:col-span-2"
          />
          <Select name="city" defaultValue={params.city ?? ""}>
            <option value="">Any city</option>
            <option value="Kampala">Kampala</option>
            <option value="Entebbe">Entebbe</option>
            <option value="Wakiso">Wakiso</option>
            <option value="Jinja">Jinja</option>
          </Select>
          <Select name="propertyType" defaultValue={params.propertyType ?? ""}>
            <option value="">Any type</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="LAND">Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </Select>
          <Select name="bedrooms" defaultValue={params.bedrooms ?? ""}>
            <option value="">Any beds</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </Select>
          <Button type="submit">Filter</Button>
        </form>

        <p className="mb-6 text-sm text-slate-500">
          {properties.length} {properties.length === 1 ? "listing" : "listings"}
        </p>

        {properties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Home}
            title="No properties match your filters"
            description="Try another city, type or bedroom count — or talk to the team for a shortlist."
            action={
              <Button variant="outline" asChild>
                <Link href="/properties">Clear filters</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
