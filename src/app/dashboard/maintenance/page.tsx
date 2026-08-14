import { Wrench } from "lucide-react";
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
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Maintenance" };

export default async function MaintenancePage() {
  await requirePagePermission("maintenance");

  const tickets = await db.maintenanceTicket.findMany({
    where: { deletedAt: null },
    include: {
      property: { select: { title: true } },
      unit: { select: { unitNumber: true } },
      tenant: { select: { firstName: true, lastName: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Work orders and service tickets."
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance tickets"
          description="Reported issues will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.ticketNumber}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {t.property.title}
                      {t.unit ? ` · ${t.unit.unitNumber}` : ""}
                    </TableCell>
                    <TableCell className="text-xs">{statusLabel(t.category)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.priority === "EMERGENCY" || t.priority === "HIGH"
                            ? "danger"
                            : statusVariant(t.priority)
                        }
                      >
                        {statusLabel(t.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(t.status)}>
                        {statusLabel(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {t.assignee?.name ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(t.reportedAt)}</TableCell>
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
