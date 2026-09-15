import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AcceptQuotationForm } from "@/components/forms/construction-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { isDatabaseAvailable } from "@/lib/db-available";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Quotations" };

export default async function QuotationsPage() {
  await requirePagePermission("projects");
  let quotations: {
    id: string;
    quotationNumber: string;
    clientName: string;
    title: string;
    currency: string;
    status: string;
    discount: unknown;
    taxRate: unknown;
    contingencyRate: unknown;
    createdAt: Date;
    project: { name: string } | null;
    items: { quantity: unknown; unitRate: unknown }[];
  }[] = [];
  quotations = await safeQuery(
    () =>
      db.clientQuotation.findMany({
        include: { items: true, project: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    [],
  );
  const dbUnavailable = !(await isDatabaseAvailable());

  return (
    <div>
      <PageHeader
        title="Client quotations"
        description={
          dbUnavailable
            ? "Database is offline. You can still create a branded PDF from New quotation."
            : "Generate construction and works quotations from the system."
        }
        actions={
          <Button asChild>
            <Link href="/dashboard/quotations/new">New quotation</Link>
          </Button>
        }
      />
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                  No saved quotations yet. Create one and download the PDF.
                </TableCell>
              </TableRow>
            ) : null}
            {quotations.map((q) => {
              const amount = q.items.reduce(
                (sum, item) => sum + Number(item.quantity) * Number(item.unitRate),
                0,
              );
              const contingency = amount * (Number(q.contingencyRate) / 100);
              const taxable = Math.max(0, amount + contingency - Number(q.discount));
              const grandTotal = taxable + taxable * (Number(q.taxRate) / 100);
              return (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{q.quotationNumber}</TableCell>
                  <TableCell>{q.clientName}</TableCell>
                  <TableCell className="font-medium">{q.title}</TableCell>
                  <TableCell>{q.project?.name ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(grandTotal, q.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(q.status)}>{statusLabel(q.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(q.createdAt)}</TableCell>
                  <TableCell className="space-y-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/quotations/${q.id}/pdf`}>Download PDF</a>
                    </Button>
                    {q.status !== "ACCEPTED" && q.status !== "DECLINED" ? (
                      <AcceptQuotationForm quotationId={q.id} />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
