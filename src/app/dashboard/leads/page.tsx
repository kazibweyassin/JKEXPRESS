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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm, LeadStageForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteLead } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  await requirePagePermission("leads");

  const [leads, properties] = await Promise.all([
    safeQuery(
      () =>
        db.lead.findMany({
          where: { deletedAt: null },
          include: {
            assignee: { select: { name: true, email: true } },
            property: { select: { title: true, reference: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      [],
    ),
    safeQuery(
      () =>
        db.property.findMany({
          where: { deletedAt: null },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        }),
      [],
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Sales pipeline and enquiry tracking."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm
            properties={properties.map((item) => ({ id: item.id, label: item.title }))}
          />
        </CardContent>
      </Card>

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
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium text-navy-900">
                        {lead.firstName} {lead.lastName}
                      </div>
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
                    <TableCell className="space-y-2">
                      <LeadStageForm id={lead.id} stage={lead.stage} />
                      <RowAction
                        action={deleteLead}
                        name="id"
                        value={lead.id}
                        label="Remove"
                        confirm="Remove this lead?"
                      />
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
