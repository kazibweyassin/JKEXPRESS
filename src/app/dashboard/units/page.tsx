import { Home } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Units" };

export default async function UnitsPage() {
  await requirePagePermission("units");

  const units = await db.unit.findMany({
    where: { deletedAt: null },
    include: {
      property: { select: { title: true, reference: true, city: true } },
    },
    orderBy: [{ propertyId: "asc" }, { unitNumber: "asc" }],
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="Units"
        description="Rental units across managed properties."
      />

      {units.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No units yet"
          description="Add units to properties to track occupancy and rent."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly rent</TableHead>
                  <TableHead>City</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.unitNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">{u.property.title}</div>
                      <div className="text-xs text-slate-500">{u.property.reference}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.unitType ? statusLabel(u.unitType) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(u.status)}>
                        {statusLabel(u.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.monthlyRent != null
                        ? formatCurrency(Number(u.monthlyRent), u.currency)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{u.property.city ?? "—"}</TableCell>
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
