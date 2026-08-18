import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Request a Quotation" };

export default function RequestQuotePage() {
  return (
    <div>
      <PageHero
        eyebrow="Quote"
        title="Request a quote"
        description="Tell us what you need. We will follow up with a clear next step."
      />
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <PublicLeadForm
              compact
              showInterest
              submitLabel="Send request"
              messageLabel="What do you need?"
              messagePlaceholder="Site, timeline, budget, or property type."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
