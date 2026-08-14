import { CreditCard } from "lucide-react";
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
import { RecordPaymentForm } from "@/components/forms/record-payment-form";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  await requirePagePermission("payments");

  const [payments, unpaidInvoices] = await Promise.all([
    db.payment.findMany({
      where: { deletedAt: null },
      include: {
        allocations: {
          include: { invoice: { select: { invoiceNumber: true } } },
        },
      },
      orderBy: { paymentDate: "desc" },
      take: 100,
    }),
    db.invoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
        balance: { gt: 0 },
      },
      orderBy: { dueDate: "asc" },
      take: 50,
      select: {
        id: true,
        invoiceNumber: true,
        balance: true,
        currency: true,
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Record and review rent and other payments."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Record payment</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordPaymentForm
              invoices={unpaidInvoices.map((i) => ({
                id: i.id,
                invoiceNumber: i.invoiceNumber,
                balance: Number(i.balance),
                currency: i.currency,
              }))}
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Recorded payments will list here."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-xs">
                          {p.paymentNumber}
                        </TableCell>
                        <TableCell className="text-xs">
                          {p.allocations
                            .map((a) => a.invoice.invoiceNumber)
                            .join(", ") || "—"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(p.amount), p.currency)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {statusLabel(p.method)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(p.paymentDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(p.status)}>
                            {statusLabel(p.status)}
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
      </div>
    </div>
  );
}
