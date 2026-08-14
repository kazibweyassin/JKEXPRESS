import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  await requirePagePermission("properties");

  const properties = await db.property.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Listings for sale and rent."
        actions={
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="h-4 w-4" />
              New property
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Create your first listing to get started."
          action={
            <Button asChild>
              <Link href="/dashboard/properties/new">Add property</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Listed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.reference}</div>
                      {p.isFeatured ? (
                        <Badge variant="gold" className="mt-1">
                          Featured
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      {statusLabel(p.propertyType)} · {statusLabel(p.listingType)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(p.price), p.currency)}
                    </TableCell>
                    <TableCell className="text-xs">{p.city ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {formatDate(p.listedAt ?? p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
