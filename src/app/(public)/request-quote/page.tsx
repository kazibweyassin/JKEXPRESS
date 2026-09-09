import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Request a Construction or Real Estate Quote",
  description:
    "Request a quotation from JK Express for construction, property sales, leasing or management services in Uganda.",
  path: "/request-quote",
});

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
