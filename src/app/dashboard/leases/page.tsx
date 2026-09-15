import { FileText } from "lucide-react";
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
import { LeaseForm, LeaseStatusForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteLease } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { daysUntil, formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leases" };

export default async function LeasesPage() {
  await requirePagePermission("leases");

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [leases, tenants, units] = await Promise.all([
    safeQuery(
      () =>
        db.lease.findMany({
          where: { deletedAt: null },
          include: {
            tenant: true,
            unit: true,
            property: true,
          },
          orderBy: { endDate: "asc" },
          take: 100,
        }),
      [],
    ),
    safeQuery(
      () =>
        db.tenant.findMany({
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true },
          orderBy: { lastName: "asc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.unit.findMany({
          where: { deletedAt: null },
          include: { property: { select: { title: true } } },
          orderBy: { unitNumber: "asc" },
        }),
      [],
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Leases"
        description="Lease agreements. Rows ending within 90 days are highlighted."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New lease</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length && units.length ? (
            <LeaseForm
              tenants={tenants.map((item) => ({
                id: item.id,
                label: `${item.firstName} ${item.lastName}`,
              }))}
              units={units.map((item) => ({
                id: item.id,
                label: `${item.property.title} · ${item.unitNumber}`,
              }))}
            />
          ) : (
            <p className="text-sm text-slate-500">Add a tenant and a unit first.</p>
          )}
        </CardContent>
      </Card>

      {leases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No leases yet"
          description="Active and historical leases will list here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => {
                  const expiringSoon =
                    lease.endDate <= in90 &&
                    lease.endDate >= now &&
                    ["ACTIVE", "EXPIRING"].includes(lease.status);
                  const days = daysUntil(lease.endDate);

                  return (
                    <TableRow
                      key={lease.id}
                      className={cn(
                        expiringSoon && "bg-amber-50/80 hover:bg-amber-50",
                      )}
                    >
                      <TableCell className="font-medium text-xs">
                        {lease.reference}
                      </TableCell>
                      <TableCell>
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </TableCell>
                      <TableCell className="text-xs">
                        {lease.property.title} · {lease.unit.unitNumber}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(lease.monthlyRent), lease.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(lease.status)}>
                          {statusLabel(lease.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expiringSoon ? (
                          <Badge variant="warning">
                            {days <= 0 ? "Ends today" : `${days}d left`}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {formatDate(lease.endDate)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="space-y-2">
                        <LeaseStatusForm id={lease.id} status={lease.status} />
                        <RowAction
                          action={deleteLease}
                          name="id"
                          value={lease.id}
                          label="Terminate"
                          confirm="Terminate this lease?"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
