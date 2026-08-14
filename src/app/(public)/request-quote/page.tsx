import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, HardHat, MessageSquareMore } from "lucide-react";

export const metadata = { title: "Request a Quotation" };

export default function RequestQuotePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8 text-white shadow-xl sm:p-10">
          <Badge variant="gold" className="mb-5">
            Tailored construction & property solutions
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Request a quotation that matches your project.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            Share your requirements and our team will follow up with a clear proposal for planning, delivery, or property management.
          </p>

          <div className="mt-8 space-y-3">
            {[
              {
                icon: HardHat,
                title: "Construction planning",
                text: "From concept design support to site execution and project coordination.",
              },
              {
                icon: Building2,
                title: "Property advisory",
                text: "Buying, selling, leasing, and long-term investment support.",
              },
              {
                icon: MessageSquareMore,
                title: "Fast follow-up",
                text: "We respond with practical next steps tailored to your needs.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="mt-0.5 rounded-xl bg-gold-400/20 p-2 text-gold-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-xl text-navy-900">Project details</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Tell us about the scope, timeline, and property needs so we can prepare the right response.
            </p>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <PublicLeadForm
              interest="CONSTRUCTION"
              showInterest={false}
              submitLabel="Request quotation"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
