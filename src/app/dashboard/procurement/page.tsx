import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PurchaseRequestForm,
  SupplierQuoteForm,
  SelectQuoteForm,
  ApprovePurchaseForm,
  ReceivePurchaseOrderForm,
} from "@/components/forms/construction-forms";

export const metadata = { title: "Procurement" };

export default async function ProcurementPage() {
  await requirePagePermission("procurement");
  const [requests, projects, suppliers, items] = await Promise.all([
    safeQuery(
      () =>
        db.purchaseRequest.findMany({
          include: {
            requester: true,
            project: true,
            items: true,
            quotations: { include: { supplier: true } },
            orders: { include: { grns: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.constructionProject.findMany({
          where: { deletedAt: null },
          select: { id: true, code: true, name: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.supplier.findMany({
          where: { deletedAt: null, isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.inventoryItem.findMany({
          where: { deletedAt: null },
          select: { id: true, sku: true, name: true, unit: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
  ]);

  const supplierOptions = suppliers.map((s) => ({ id: s.id, label: s.name }));
  const itemOptions = items.map((item) => ({
    id: item.id,
    label: `${item.sku} — ${item.name} (${item.unit})`,
  }));

  return (
    <div>
      <PageHeader
        title="Material purchase"
        description="Request → supplier quotes → purchase order → goods received into stores."
      />
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">New purchase request</CardTitle></CardHeader>
        <CardContent>
          <PurchaseRequestForm
            projects={projects.map((p) => ({ id: p.id, label: `${p.code} — ${p.name}` }))}
          />
        </CardContent>
      </Card>
      {requests.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase requests"
          description="Employee purchase requests will appear here."
        />
      ) : (
        <div className="space-y-6">
          {requests.map((pr) => {
            const selected = pr.quotations.find((quote) => quote.isSelected);
            const openOrder = pr.orders.find((order) =>
              ["ISSUED", "PARTIAL"].includes(order.status),
            );
            return (
              <Card key={pr.id}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {pr.requestNumber} · {pr.title}
                    <Badge variant={statusVariant(pr.status)}>{statusLabel(pr.status)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-slate-600">
                    {pr.requester.name} · {pr.project?.name ?? "General"} · {formatDate(pr.createdAt)}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Est. rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pr.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{Number(item.quantity)} {item.unit}</TableCell>
                          <TableCell>
                            {item.estimatedUnitCost
                              ? formatCurrency(Number(item.estimatedUnitCost))
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pr.quotations.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier quote</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Selected</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pr.quotations.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell>{quote.supplier.name}</TableCell>
                            <TableCell>{formatCurrency(Number(quote.amount), quote.currency)}</TableCell>
                            <TableCell>{quote.isSelected ? "Yes" : "—"}</TableCell>
                            <TableCell>
                              {!quote.isSelected ? <SelectQuoteForm quotationId={quote.id} /> : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-slate-500">No supplier quotations yet.</p>
                  )}

                  {supplierOptions.length ? (
                    <SupplierQuoteForm requestId={pr.id} suppliers={supplierOptions} />
                  ) : (
                    <p className="text-slate-500">Register a supplier before adding quotations.</p>
                  )}

                  {selected && !openOrder && pr.status !== "RECEIVED" ? (
                    <ApprovePurchaseForm requestId={pr.id} />
                  ) : null}

                  {pr.orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-slate-100 p-3">
                      <p className="font-medium">
                        {order.orderNumber} · {formatCurrency(Number(order.totalAmount), order.currency)} ·{" "}
                        {statusLabel(order.status)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.grns.length} goods-received note{order.grns.length === 1 ? "" : "s"}
                      </p>
                      {["ISSUED", "PARTIAL"].includes(order.status) && itemOptions.length ? (
                        <div className="mt-3">
                          <ReceivePurchaseOrderForm
                            orderId={order.id}
                            items={itemOptions}
                            hasProject={Boolean(pr.projectId)}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
