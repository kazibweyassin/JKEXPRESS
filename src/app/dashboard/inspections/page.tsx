import { ClipboardCheck } from "lucide-react";
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
import { CompleteInspectionForm, InspectionForm } from "@/components/forms/directory-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Inspections" };

export default async function InspectionsPage() {
  await requirePagePermission("inspections");

  const [inspections, properties, units] = await Promise.all([
    safeQuery(
      () =>
        db.inspection.findMany({
          include: {
            property: { select: { title: true } },
            unit: { select: { unitNumber: true } },
            inspector: { select: { name: true } },
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
        title="Inspections"
        description="Move-in, routine and move-out inspections."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Schedule inspection</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length ? (
            <InspectionForm
              properties={properties.map((item) => ({ id: item.id, label: item.title }))}
              units={units.map((item) => ({
                id: item.id,
                label: `${item.property.title} · ${item.unitNumber}`,
              }))}
            />
          ) : (
            <p className="text-sm text-slate-500">Create a property first.</p>
          )}
        </CardContent>
      </Card>

      {inspections.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No inspections yet"
          description="Scheduled property inspections will list here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-xs">
                      {statusLabel(i.type)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.property.title}
                      {i.unit ? ` · ${i.unit.unitNumber}` : ""}
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.inspector?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(i.scheduledAt)}</TableCell>
                    <TableCell className="text-xs">{formatDate(i.completedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(i.status)}>
                        {statusLabel(i.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.overallRating ? statusLabel(i.overallRating) : "—"}
                    </TableCell>
                    <TableCell>
                      {i.status !== "COMPLETED" ? <CompleteInspectionForm id={i.id} /> : null}
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
