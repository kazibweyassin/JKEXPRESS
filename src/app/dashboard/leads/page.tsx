import Link from "next/link";
import { Users } from "lucide-react";
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

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  await requirePagePermission("leads");

  const leads = await db.lead.findMany({
    where: { deletedAt: null },
    include: {
      assignee: { select: { name: true, email: true } },
      property: { select: { title: true, reference: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Sales pipeline and enquiry tracking."
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="New website enquiries and sales leads will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-navy-900 hover:underline"
                      >
                        {lead.firstName} {lead.lastName}
                      </Link>
                      <div className="text-xs text-slate-500">{lead.reference}</div>
                      {lead.phone ? (
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(lead.stage)}>
                        {statusLabel(lead.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{statusLabel(lead.source)}</TableCell>
                    <TableCell className="text-xs">
                      {lead.property?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {lead.assignee?.name ?? lead.assignee?.email ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(lead.createdAt)}</TableCell>
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
