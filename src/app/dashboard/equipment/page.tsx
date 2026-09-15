import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/forms/construction-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteEquipment } from "@/app/actions/construction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Equipment" };

export default async function EquipmentPage() {
  await requirePagePermission("equipment");
  const equipment = await safeQuery(
    () =>
      db.equipment.findMany({
        where: { deletedAt: null },
        orderBy: { code: "asc" },
      }),
    [],
  );

  return (
    <div>
      <PageHeader title="Equipment" description="Company plant and tools. Subcontractor plant stays off this register." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Register equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm />
        </CardContent>
      </Card>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Next service</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell className="font-mono text-xs">{eq.code}</TableCell>
                <TableCell className="font-medium">{eq.name}</TableCell>
                <TableCell>{eq.category ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(eq.condition)}>
                    {statusLabel(eq.condition)}
                  </Badge>
                </TableCell>
                <TableCell>{eq.currentLocation ?? "—"}</TableCell>
                <TableCell>{formatDate(eq.nextServiceDate)}</TableCell>
                <TableCell>
                  <RowAction
                    action={deleteEquipment}
                    name="id"
                    value={eq.id}
                    label="Remove"
                    confirm="Remove this equipment record?"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
