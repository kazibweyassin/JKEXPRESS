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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitForm, UnitStatusForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteUnit } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Units" };

export default async function UnitsPage() {
  await requirePagePermission("units");

  const [units, properties] = await Promise.all([
    safeQuery(
      () =>
        db.unit.findMany({
          where: { deletedAt: null },
          include: {
            property: { select: { title: true, reference: true, city: true } },
          },
          orderBy: [{ propertyId: "asc" }, { unitNumber: "asc" }],
          take: 200,
        }),
      [],
    ),
    safeQuery(
      () =>
        db.property.findMany({
          where: { deletedAt: null },
          select: { id: true, title: true, reference: true },
          orderBy: { title: "asc" },
        }),
      [],
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Units"
        description="Rental units across managed properties."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add unit</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length ? (
            <UnitForm
              properties={properties.map((item) => ({
                id: item.id,
                label: `${item.reference} — ${item.title}`,
              }))}
            />
          ) : (
            <p className="text-sm text-slate-500">Create a property first.</p>
          )}
        </CardContent>
      </Card>

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
                  <TableHead></TableHead>
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
                    <TableCell className="space-y-2">
                      <UnitStatusForm id={u.id} status={u.status} />
                      <RowAction
                        action={deleteUnit}
                        name="id"
                        value={u.id}
                        label="Remove"
                        confirm="Remove this unit?"
                      />
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
