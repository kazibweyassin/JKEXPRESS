import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">Schedule a viewing</h1>
      <p className="mt-2 text-slate-600">
        {property
          ? `Request a viewing for ${property.title}.`
          : "Request a property viewing. Our sales team will confirm a time."}
      </p>
      <Card className="mt-8">
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
  );
}
