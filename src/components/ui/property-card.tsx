import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Images, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { propertyCoverImage } from "@/lib/property-images";
import { formatCurrency, statusLabel } from "@/lib/utils";

export type PropertyCardProperty = {
  id: string;
  slug: string;
  title: string;
  city?: string | null;
  district?: string | null;
  price: number | string | { toString(): string };
  currency: string;
  listingType: string;
  propertyType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertySize?: number | null;
  images?: { url: string }[];
  imageCount?: number;
};

export function PropertyCard({ property }: { property: PropertyCardProperty }) {
  const cover = propertyCoverImage(
    property.id,
    property.propertyType,
    property.images?.[0]?.url,
  );
  const photoCount = Math.max(
    property.imageCount ?? property.images?.length ?? 0,
    1,
  );
  const facts = [
    property.bedrooms != null
      ? { icon: BedDouble, label: `${property.bedrooms} beds` }
      : null,
    property.bathrooms != null
      ? { icon: Bath, label: `${property.bathrooms} baths` }
      : null,
    property.propertySize != null
      ? { icon: Ruler, label: `${property.propertySize} sqm` }
      : null,
  ].filter(Boolean) as { icon: typeof BedDouble; label: string }[];

  return (
    <Link href={`/properties/${property.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-2xl transition hover:shadow-md hover:ring-1 hover:ring-accent-500/25">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
          <Image
            src={cover}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant={property.listingType === "SALE" ? "accent" : "default"}>
              {property.listingType === "SALE" ? "For sale" : "For rent"}
            </Badge>
            <Badge variant="secondary">{statusLabel(property.propertyType)}</Badge>
          </div>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <Images className="h-3 w-3" />
            {photoCount} {photoCount === 1 ? "photo" : "photos"}
          </span>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-navy-900 line-clamp-1">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {[property.city, property.district].filter(Boolean).join(", ") ||
              "Uganda"}
          </p>
          {facts.length > 0 ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              {facts.map((fact) => (
                <span key={fact.label} className="inline-flex items-center gap-1">
                  <fact.icon className="h-3.5 w-3.5 text-slate-400" />
                  {fact.label}
                </span>
              ))}
            </p>
          ) : null}
          <p className="mt-3 text-lg font-bold text-navy-900">
            {formatCurrency(Number(property.price), property.currency)}
            {property.listingType === "RENT" ? (
              <span className="text-sm font-normal text-slate-500"> /mo</span>
            ) : null}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
