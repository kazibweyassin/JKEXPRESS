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
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { createMaintenanceTicket } from "@/app/actions/maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Tenant portal" };

export default async function TenantPortalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenant = await db.tenant.findUnique({
    where: { userId: session.user.id },
  });

  if (!tenant && session.user.role.slug !== "super-administrator") {
    return (
      <p className="text-slate-600">
        No tenant profile is linked to this account. Contact property management.
      </p>
    );
  }

  const tenantId = tenant?.id;
  const lease = tenantId
    ? await db.lease.findFirst({
        where: {
          tenantId,
          status: { in: ["ACTIVE", "EXPIRING"] },
          deletedAt: null,
        },
        include: { property: true, unit: true },
        orderBy: { startDate: "desc" },
      })
    : null;

  const invoices = tenantId
    ? await db.invoice.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { dueDate: "desc" },
        take: 12,
      })
    : [];

  const payments = tenantId
    ? await db.payment.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { paymentDate: "desc" },
        take: 12,
      })
    : [];

  const tickets = tenantId
    ? await db.maintenanceTicket.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { reportedAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${tenant?.firstName ?? session.user.name}`}
        description="Your lease, invoices, payments and maintenance requests."
      />

      {lease ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Current lease</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Property</p>
              <p className="font-medium">{lease.property.title}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unit</p>
              <p className="font-medium">{lease.unit.unitNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Period</p>
              <p className="font-medium">
                {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Monthly rent</p>
              <p className="font-medium">
                {formatCurrency(Number(lease.monthlyRent), lease.currency)}
              </p>
            </div>
            <div>
              <Badge variant={statusVariant(lease.status)}>
                {statusLabel(lease.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-sm text-slate-500">
            No active lease found.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rent invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(inv.balance), inv.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inv.status)}>
                        {statusLabel(inv.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{p.paymentNumber}</TableCell>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(p.amount), p.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Maintenance requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="mb-6 divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.ticketNumber}</p>
                </div>
                <Badge variant={statusVariant(t.status)}>{statusLabel(t.status)}</Badge>
              </li>
            ))}
            {tickets.length === 0 ? (
              <li className="py-4 text-sm text-slate-500">No maintenance tickets.</li>
            ) : null}
          </ul>

          {lease ? (
            <form action={createMaintenanceTicket} className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-navy-900">Submit a request</p>
              <input type="hidden" name="propertyId" value={lease.propertyId} />
              <input type="hidden" name="unitId" value={lease.unitId} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <Select id="category" name="category" defaultValue="GENERAL" required>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="HVAC">HVAC</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="GENERAL">General</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="priority">Priority</Label>
                  <Select id="priority" name="priority" defaultValue="NORMAL">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required rows={3} />
              </div>
              <Button type="submit" size="sm">
                Submit request
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
