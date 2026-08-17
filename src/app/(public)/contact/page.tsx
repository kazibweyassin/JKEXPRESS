import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapEmbed } from "@/components/ui/map-embed";
import { PageHero } from "@/components/ui/page-hero";
import { getCompanySettings } from "@/lib/company";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const company = await getCompanySettings();
  const address = [company.address, company.city, company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <PageHero
        eyebrow="Get in touch"
        title="Contact us"
        description="We respond to inquiries during business hours (Africa/Kampala)."
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicLeadForm submitLabel="Send message" />
            </CardContent>
          </Card>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> Office
              </p>
              <p className="mt-2 font-medium text-navy-900">{address}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Phone className="h-3.5 w-3.5" /> Phone
              </p>
              <p className="mt-2 font-medium text-navy-900">{company.phone}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Mail className="h-3.5 w-3.5" /> Email
              </p>
              <a
                href={`mailto:${company.email}`}
                className="mt-2 block font-medium text-navy-900 hover:underline"
              >
                {company.email}
              </a>
            </div>
            <MapEmbed query={address} title="JK Express office location" className="h-56 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
