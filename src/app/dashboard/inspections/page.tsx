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
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Inspections" };

export default async function InspectionsPage() {
  await requirePagePermission("inspections");

  const inspections = await db.inspection.findMany({
    include: {
      property: { select: { title: true } },
      unit: { select: { unitNumber: true } },
      inspector: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Inspections"
        description="Move-in, routine and move-out inspections."
      />

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
