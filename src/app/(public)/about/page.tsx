import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Building2,
  HardHat,
  KeyRound,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";
import { SITE_PHOTOS } from "@/lib/site-photos";

export const metadata = {
  title: "About Us | JK Express",
  description:
    "Learn about JK Express — construction, real estate and property management across Uganda.",
};

export default async function AboutPage() {
  const company = await getCompanySettings();

  let propertyCount = 0;
  let completedProjects = 0;
  let activeLeases = 0;

  try {
    [propertyCount, completedProjects, activeLeases] = await Promise.all([
      db.property.count({ where: { isPublished: true, deletedAt: null } }),
      db.constructionProject.count({
        where: { status: "COMPLETED", deletedAt: null },
      }),
      db.lease.count({ where: { status: "ACTIVE" } }),
    ]);
  } catch {
    // DB unavailable — show defaults
  }

  const pillars = [
    {
      icon: HardHat,
      title: "Construction",
      text: "Disciplined project delivery for residential, commercial and institutional clients.",
    },
    {
      icon: Building2,
      title: "Real estate",
      text: "Brokerage and advisory for homes, land and commercial assets across Uganda.",
    },
    {
      icon: KeyRound,
      title: "Property management",
      text: "Tenant relations, collections, maintenance and transparent owner reporting.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Integrity",
      text: "Clear contracts, honest timelines and transparent financial reporting.",
    },
    {
      icon: Award,
      title: "Quality",
      text: "Site controls and finish standards that protect long-term asset value.",
    },
    {
      icon: Users,
      title: "Partnership",
      text: "We work alongside owners, tenants and contractors as a trusted operator.",
    },
    {
      icon: MapPin,
      title: "Local expertise",
      text: "Deep knowledge of Kampala and East African property markets.",
    },
  ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Badge variant="gold" className="mb-4">
            About {company.companyName}
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Building trust across construction, sales and property operations
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            {company.description ??
              `${company.companyName} is a full-lifecycle property company serving Uganda with construction delivery, real estate brokerage and professional property management.`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Who we are"
          description={`${company.companyName} brings design-build capability, market knowledge and asset operations under one roof — so clients can plan, invest and manage with confidence.`}
        />

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {[SITE_PHOTOS[0], SITE_PHOTOS[13]].map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-navy-50 p-3 text-navy-900">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { label: "Published properties", value: propertyCount },
            { label: "Completed projects", value: completedProjects },
            { label: "Active leases", value: activeLeases },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center"
            >
              <p className="text-3xl font-bold text-navy-900">{s.value}+</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Our values"
            description="Principles that guide every site, listing and tenancy we manage."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <Card key={v.title}>
                <CardContent className="p-6">
                  <v.icon className="h-6 w-6 text-gold-600" />
                  <h3 className="mt-3 font-semibold text-navy-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{v.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy-900">Where we operate</h2>
            <p className="mt-4 text-slate-600">
              Headquartered in {company.city ?? "Kampala"},{" "}
              {company.country ?? "Uganda"}, we serve clients across major urban
              centres and growth corridors in East Africa. Our teams coordinate
              construction sites, sales pipelines and managed portfolios from a
              single operating platform.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-600" />
                {[company.address, company.city, company.country]
                  .filter(Boolean)
                  .join(", ")}
              </li>
              <li>
                <a
                  href={`tel:${company.phone}`}
                  className="text-navy-800 hover:underline"
                >
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="text-navy-800 hover:underline"
                >
                  {company.email}
                </a>
              </li>
            </ul>
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200">
              <Image
                src={SITE_PHOTOS[7].src}
                alt={SITE_PHOTOS[7].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
          <Card className="bg-navy-900 text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold">Work with us</h3>
              <p className="mt-3 text-sm text-slate-300">
                Whether you need a construction partner, a trusted broker or a
                property manager, our team is ready to help.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="gold" asChild>
                  <Link href="/contact">Contact us</Link>
                </Button>
                <Button
                  variant="default"
                  className="border-white/30 bg-white text-navy-900 hover:bg-slate-100"
                  asChild
                >
                  <Link href="/careers">View careers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
