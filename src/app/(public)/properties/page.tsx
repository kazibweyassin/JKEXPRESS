import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { db } from "@/lib/db";
import { propertyCoverImage } from "@/lib/property-images";
import { formatCurrency } from "@/lib/utils";

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

  const properties = await db.property.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      ...(params.listingType ? { listingType: params.listingType } : {}),
      ...(params.city ? { city: { contains: params.city } } : {}),
      ...(params.propertyType ? { propertyType: params.propertyType } : {}),
      ...(bedrooms ? { bedrooms: { gte: bedrooms } } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q } },
              { description: { contains: params.q } },
              { address: { contains: params.q } },
            ],
          }
        : {}),
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: [{ isFeatured: "desc" }, { listedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Properties</h1>
        <p className="mt-2 text-slate-600">
          Homes, land and commercial spaces for sale and rent across Uganda.
        </p>
      </div>

      <form className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input name="q" placeholder="Search..." defaultValue={params.q} className="lg:col-span-2" />
        <Select name="listingType" defaultValue={params.listingType ?? ""}>
          <option value="">Sale or rent</option>
          <option value="SALE">For sale</option>
          <option value="RENT">For rent</option>
        </Select>
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
        <Button type="submit">Filter</Button>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.slug}`}>
            <Card className="h-full overflow-hidden transition hover:shadow-md">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={propertyCoverImage(p.id, p.propertyType, p.images[0]?.url)}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant={p.listingType === "SALE" ? "gold" : "default"}>
                    {p.listingType === "SALE" ? "For sale" : "For rent"}
                  </Badge>
                  <Badge variant="secondary">{p.propertyType}</Badge>
                </div>
                <h2 className="font-semibold text-navy-900 line-clamp-1">{p.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {[p.city, p.district].filter(Boolean).join(", ")}
                </p>
                <p className="mt-3 text-lg font-bold text-navy-900">
                  {formatCurrency(Number(p.price), p.currency)}
                  {p.listingType === "RENT" ? (
                    <span className="text-sm font-normal text-slate-500"> /mo</span>
                  ) : null}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {properties.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No properties match your filters.</p>
      ) : null}
    </div>
  );
}
