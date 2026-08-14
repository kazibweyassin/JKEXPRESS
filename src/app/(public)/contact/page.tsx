import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanySettings } from "@/lib/company";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const company = await getCompanySettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">Contact us</h1>
      <p className="mt-2 text-slate-600">
        We respond to inquiries during business hours (Africa/Kampala).
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <PublicLeadForm submitLabel="Send message" />
          </CardContent>
        </Card>
        <div className="space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Office</p>
            <p className="mt-2 font-medium text-navy-900">
              {[company.address, company.city, company.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
            <p className="mt-2 font-medium text-navy-900">{company.phone}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-2 font-medium text-navy-900">{company.email}</p>
          </div>
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
            Map placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
