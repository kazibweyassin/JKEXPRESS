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
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { ShoppingCart } from "lucide-react";

export const metadata = { title: "Procurement" };

export default async function ProcurementPage() {
  await requirePagePermission("procurement");
  const requests = await db.purchaseRequest.findMany({
    include: {
      requester: true,
      project: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Procurement"
        description="Purchase requests and approval workflow."
      />
      {requests.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase requests"
          description="Employee purchase requests will appear here."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>
                    <div className="font-medium">{pr.title}</div>
                    <div className="text-xs text-slate-500">{pr.requestNumber}</div>
                  </TableCell>
                  <TableCell>{pr.requester.name}</TableCell>
                  <TableCell>{pr.project?.name ?? "—"}</TableCell>
                  <TableCell>{pr.items.length}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(pr.status)}>
                      {statusLabel(pr.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(pr.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
