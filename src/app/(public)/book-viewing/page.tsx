import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { db } from "@/lib/db";

export const metadata = { title: "Schedule a Property Viewing" };

export default async function BookViewingPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const { propertyId } = await searchParams;
  const property = propertyId
    ? await db.property.findUnique({ where: { id: propertyId } })
    : null;

  return (
    <div>
      <PageHero
        eyebrow="Viewings"
        title="Schedule a viewing"
        description={
          property
            ? `Request a viewing for ${property.title}.`
            : "Request a property viewing. Our sales team will confirm a time."
        }
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Viewing request</CardTitle>
          </CardHeader>
          <CardContent>
            <PublicLeadForm
              propertyId={property?.id}
              interest="VIEWING"
              showInterest={false}
              submitLabel="Request viewing"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
