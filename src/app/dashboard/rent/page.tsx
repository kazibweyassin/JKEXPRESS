import { Wallet } from "lucide-react";
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
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Rent invoices" };

export default async function RentPage() {
  await requirePagePermission("rent");

  const invoices = await db.invoice.findMany({
    where: { deletedAt: null },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: true,
          property: true,
        },
      },
    },
    orderBy: { dueDate: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Rent invoices"
        description="Invoices with outstanding balances."
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No invoices yet"
          description="Rent and service invoices will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tenant / Unit</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="font-medium text-xs">{inv.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">{statusLabel(inv.type)}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {inv.lease ? (
                        <>
                          <div>
                            {inv.lease.tenant.firstName} {inv.lease.tenant.lastName}
                          </div>
                          <div className="text-slate-500">
                            {inv.lease.property.title} · {inv.lease.unit.unitNumber}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(inv.totalAmount), inv.currency)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(inv.amountPaid), inv.currency)}
                    </TableCell>
                    <TableCell className="font-medium">
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
      )}
    </div>
  );
}
