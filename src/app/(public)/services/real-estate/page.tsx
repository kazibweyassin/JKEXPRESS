import Link from "next/link";
import {
  ArrowRight,
  Building2,
  HandCoins,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PropertyCard } from "@/components/ui/property-card";
import { db } from "@/lib/db";

export const metadata = {
  title: "Real Estate Services | JK Express",
  description:
    "Buy, sell and rent properties across Uganda with JK Express brokerage and advisory.",
};

export default async function RealEstateServicePage() {
  const featured = await db.property
    .findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { images: true } },
      },
      take: 3,
      orderBy: [{ isFeatured: "desc" }, { listedAt: "desc" }],
    })
    .catch(() => []);

  const offerings = [
    {
      icon: Search,
      title: "Sales & acquisitions",
      text: "Market homes, land and commercial assets with professional listing support.",
    },
    {
      icon: HandCoins,
      title: "Rentals & leasing",
      text: "Match tenants and landlords with clear terms and viewing coordination.",
    },
    {
      icon: Users,
      title: "Advisory",
      text: "Pricing guidance, neighbourhood insight and investment shortlists.",
    },
    {
      icon: Building2,
      title: "Marketing reach",
      text: "Featured placement on our platform and coordinated viewing calendars.",
    },
  ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge variant="gold" className="mb-4">
            Real estate
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Brokerage that moves decisions forward
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Whether you are buying your next home, leasing commercial space or
            disposing of an asset, our agents guide you from shortlist to close.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/properties">
                Browse properties <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="default"
              className="border-white/30 bg-white text-navy-900 hover:bg-slate-100"
              asChild
            >
              <Link href="/book-viewing">Book a viewing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="How we help"
          description="Practical support for buyers, sellers, landlords and tenants."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {offerings.map((o) => (
            <Card key={o.title}>
              <CardContent className="p-6">
                <o.icon className="h-6 w-6 text-navy-900" />
                <h3 className="mt-3 font-semibold text-navy-900">{o.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{o.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PageHeader
              title="Featured listings"
              description="A snapshot of currently published inventory."
              actions={
                <Button variant="outline" asChild>
                  <Link href="/properties">View all</Link>
                </Button>
              }
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={{ ...p, imageCount: p._count.images }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-12 text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            List with JK Express or find your next home
          </h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Tell us what you are looking for — or what you need to market — and
            an agent will follow up.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/contact">Speak to an agent</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/properties">Search listings</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
