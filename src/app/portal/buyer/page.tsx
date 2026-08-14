import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Buyer portal" };

export default async function BuyerPortalPage() {
  await requireSession("/portal/buyer");
  const properties = await db.property.findMany({
    where: {
      isPublished: true,
      listingType: "SALE",
      deletedAt: null,
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { listedAt: "desc" },
    take: 12,
  });

  return (
    <div>
      <PageHeader
        title="Buyer portal"
        description="Properties currently available for sale."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.slug}`}>
            <Card className="h-full transition hover:shadow-md">
              <CardContent className="p-4">
                <Badge variant="gold" className="mb-2">
                  For sale
                </Badge>
                <h2 className="font-semibold text-navy-900">{p.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{p.city}</p>
                <p className="mt-2 font-bold">
                  {formatCurrency(Number(p.price), p.currency)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
