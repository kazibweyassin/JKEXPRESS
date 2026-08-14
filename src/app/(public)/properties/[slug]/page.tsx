import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";
import { formatCurrency, statusLabel } from "@/lib/utils";
import { propertyCoverImage } from "@/lib/property-images";
import { whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await db.property.findUnique({ where: { slug } });
  return { title: property?.title ?? "Property" };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanySettings();
  const property = await db.property.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: true,
      agent: true,
    },
  });

  if (!property) notFound();

  const waLink = whatsappLink(
    company.whatsapp ?? company.phone,
    `Hello, I'm interested in ${property.title} (${property.reference})`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/properties" className="text-sm text-navy-700 hover:underline">
          ← All properties
        </Link>
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[16/9] overflow-hidden rounded-xl bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={propertyCoverImage(
                property.id,
                property.propertyType,
                property.images[0]?.url,
              )}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={property.listingType === "SALE" ? "gold" : "default"}>
                {property.listingType === "SALE" ? "For sale" : "For rent"}
              </Badge>
              <Badge variant="secondary">{property.propertyType}</Badge>
              <Badge variant="outline">{statusLabel(property.status)}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-navy-900">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-slate-600">
              <MapPin className="h-4 w-4" />
              {[property.address, property.city, property.district, property.country]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="mt-4 text-3xl font-bold text-navy-900">
              {formatCurrency(Number(property.price), property.currency)}
              {property.listingType === "RENT" ? (
                <span className="text-base font-normal text-slate-500"> / month</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ref: {property.reference}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-700">
            {property.bedrooms != null ? (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> {property.bedrooms} beds
              </span>
            ) : null}
            {property.bathrooms != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-4 w-4" /> {property.bathrooms} baths
              </span>
            ) : null}
            {property.parkingSpaces != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Car className="h-4 w-4" /> {property.parkingSpaces} parking
              </span>
            ) : null}
            {property.propertySize != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-4 w-4" /> {property.propertySize} sqm
              </span>
            ) : null}
          </div>
          {property.description ? (
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-slate-600">{property.description}</p>
            </div>
          ) : null}
          {property.amenities.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <li key={a.id}>
                    <Badge variant="secondary">{a.name}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request information</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicLeadForm
                propertyId={property.id}
                interest={property.listingType}
                showInterest={false}
                submitLabel="Send inquiry"
              />
              {waLink ? (
                <Button variant="default" className="mt-4 w-full" asChild>
                  <a href={waLink} target="_blank" rel="noreferrer">
                    WhatsApp agent
                  </a>
                </Button>
              ) : null}
              <Button variant="default" className="mt-2 w-full" asChild>
                <Link href={`/book-viewing?propertyId=${property.id}`}>
                  Schedule a viewing
                </Link>
              </Button>
            </CardContent>
          </Card>
          {property.agent ? (
            <Card>
              <CardContent className="p-5 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Assigned agent</p>
                <p className="mt-1 font-semibold text-navy-900">{property.agent.name}</p>
                {property.agent.email ? (
                  <p className="text-slate-600">{property.agent.email}</p>
                ) : null}
                {property.agent.phone ? (
                  <p className="text-slate-600">{property.agent.phone}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
