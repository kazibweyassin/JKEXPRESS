import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Owner portal" };

export default async function OwnerPortalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const owner = await db.propertyOwner.findUnique({
    where: { userId: session.user.id },
  });

  if (!owner && session.user.role.slug !== "super-administrator") {
    return (
      <p className="text-slate-600">
        No property owner profile is linked to this account.
      </p>
    );
  }

  const ownerId = owner?.id;
  const properties = ownerId
    ? await db.property.findMany({
        where: { ownerId, deletedAt: null },
        include: {
          units: true,
          expenses: { orderBy: { expenseDate: "desc" }, take: 5 },
        },
      })
    : [];

  const totalUnits = properties.reduce((n, p) => n + p.units.length, 0);
  const occupied = properties.reduce(
    (n, p) => n + p.units.filter((u) => u.status === "OCCUPIED").length,
    0,
  );

  return (
    <div>
      <PageHeader
        title={`Owner portal${owner ? ` — ${owner.firstName} ${owner.lastName}` : ""}`}
        description="Your properties, occupancy and expenses only."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Properties</p>
            <p className="text-2xl font-bold">{properties.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Units</p>
            <p className="text-2xl font-bold">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Occupied</p>
            <p className="text-2xl font-bold">
              {occupied}/{totalUnits}
            </p>
          </CardContent>
        </Card>
      </div>

      {properties.map((property) => (
        <Card key={property.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">{property.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {property.units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unitNumber}</TableCell>
                    <TableCell>{unit.unitType ?? "—"}</TableCell>
                    <TableCell>
                      {unit.monthlyRent
                        ? formatCurrency(Number(unit.monthlyRent), unit.currency)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(unit.status)}>
                        {statusLabel(unit.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {property.units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-slate-500">
                      No units recorded (single-unit property)
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            {property.expenses.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">
                  Recent expenses
                </p>
                <ul className="space-y-1 text-sm">
                  {property.expenses.map((e) => (
                    <li key={e.id} className="flex justify-between">
                      <span>{e.description}</span>
                      <span>{formatCurrency(Number(e.amount), e.currency)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}

      {properties.length === 0 ? (
        <p className="text-slate-500">No properties assigned to this owner.</p>
      ) : null}
    </div>
  );
}
