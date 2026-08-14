import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyForm } from "@/components/forms/property-form";
import { requirePagePermission } from "@/lib/auth-guard";

export const metadata = { title: "New property" };

export default async function NewPropertyPage() {
  await requirePagePermission("properties", "create");

  return (
    <div>
      <PageHeader
        title="New property"
        description="Create a sale or rental listing."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/properties">Back to list</Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  );
}
