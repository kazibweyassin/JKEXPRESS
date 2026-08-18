import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  HardHat,
  Home,
  KeyRound,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCompanySettings } from "@/lib/company";

export const metadata = {
  title: "Services | JK Express",
  description:
    "Construction, real estate brokerage and property management services from JK Express.",
};

const services = [
  {
    href: "/services/construction",
    icon: HardHat,
    title: "Construction",
    badge: "Build",
    text: "Residential, commercial and institutional projects with structured planning, BOQs, site reporting and milestone control.",
    points: [
      "Project planning & mobilisation",
      "BOQ and cost control",
      "Site supervision & reporting",
      "Handover & snagging",
    ],
  },
  {
    href: "/services/real-estate",
    icon: Building2,
    title: "Real estate",
    badge: "Buy & sell",
    text: "End-to-end brokerage for sales and rentals — homes, land, offices and investment assets across Uganda.",
    points: [
      "Property listings & marketing",
      "Buyer and tenant matching",
      "Viewings & negotiations",
      "Transaction support",
    ],
  },
  {
    href: "/services/property-management",
    icon: KeyRound,
    title: "Property management",
    badge: "Operate",
    text: "Professional portfolio operations including leasing, collections, maintenance and owner statements.",
    points: [
      "Tenant placement & leases",
      "Rent collection & arrears",
      "Maintenance ticketing",
      "Owner reporting",
    ],
  },
];

export default async function ServicesPage() {
  const company = await getCompanySettings();

  return (
    <div>
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge variant="gold" className="mb-4">
            What we do
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Full-lifecycle property services
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            From groundbreaking to long-term asset management, {company.companyName}{" "}
            delivers construction, brokerage and operations under one trusted brand.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Our service lines"
          description="Choose a capability below or speak with our team for a tailored engagement."
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s.href}
              className="flex flex-col overflow-hidden transition hover:shadow-md hover:ring-1 hover:ring-gold-500/30"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="inline-flex rounded-lg bg-navy-50 p-3 text-navy-900">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{s.badge}</Badge>
                </div>
                <h2 className="text-xl font-semibold text-navy-900">{s.title}</h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">{s.text}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button variant="default" className="mt-6 w-full" asChild>
                  <Link href={s.href}>
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="How engagements typically work"
            description="A simple path from first conversation to delivery."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                step: "01",
                title: "Discovery",
                text: "Share your goals — new build, acquisition, lease-up or portfolio ops.",
              },
              {
                icon: Home,
                step: "02",
                title: "Proposal",
                text: "We scope scope, timeline, commercials and success metrics with you.",
              },
              {
                icon: Wrench,
                step: "03",
                title: "Delivery",
                text: "Dedicated teams execute with reporting you can share with stakeholders.",
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <item.icon className="h-6 w-6 text-gold-600" />
                    <span className="text-sm font-bold text-navy-300">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button variant="default" asChild>
              <Link href="/contact">Talk to our team</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/properties">Browse properties</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
