import Link from "next/link";
import {
  ArrowRight,
  FileText,
  KeyRound,
  LineChart,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCompanySettings } from "@/lib/company";

export const metadata = {
  title: "Property Management | JK Express",
  description:
    "Professional property management — leasing, collections, maintenance and owner reporting.",
};

export default async function PropertyManagementServicePage() {
  const company = await getCompanySettings();

  const services = [
    {
      icon: KeyRound,
      title: "Leasing & tenant relations",
      text: "Placement, onboarding, renewals and day-to-day tenant communication.",
    },
    {
      icon: LineChart,
      title: "Collections & arrears",
      text: "Structured rent cycles, payment tracking and polite arrears follow-up.",
    },
    {
      icon: Wrench,
      title: "Maintenance coordination",
      text: "Ticket intake, vendor dispatch and resolution tracking for every unit.",
    },
    {
      icon: FileText,
      title: "Owner statements",
      text: "Clear income, expense and occupancy reporting you can share with partners.",
    },
    {
      icon: ShieldCheck,
      title: "Compliance & inspections",
      text: "Move-in/out inspections, condition records and documentation control.",
    },
  ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge variant="gold" className="mb-4">
            Property management
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Operate assets with professional discipline
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            {company.companyName} manages residential and commercial portfolios
            with transparent processes for leasing, rent collection, maintenance
            and owner reporting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/contact">
                Discuss your portfolio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="default"
              className="border-white/30 bg-white text-navy-900 hover:bg-slate-100"
              asChild
            >
              <Link href="/properties?listingType=RENT">View rentals</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Management scope"
          description="A complete operating stack for landlords and institutional owners."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-navy-50 p-3 text-navy-900">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Why owners choose us"
            description="Operational clarity without losing the personal touch tenants expect."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Single platform",
                text: "Leases, tickets, payments and reports connected — fewer spreadsheets.",
              },
              {
                title: "Proactive care",
                text: "Issues logged, assigned and closed with an audit trail.",
              },
              {
                title: "Aligned incentives",
                text: "We protect occupancy, collections and asset condition together.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <h3 className="font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-12 text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Hand over operations with confidence
          </h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Share your unit mix, current occupancy and pain points — we will
            propose a management approach tailored to your portfolio.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/contact">Contact management team</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/services">All services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
