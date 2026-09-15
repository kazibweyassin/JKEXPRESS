import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierForm } from "@/components/forms/construction-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteSupplier } from "@/app/actions/construction";
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

export const metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  await requirePagePermission("suppliers");
  const suppliers = await safeQuery(
    () =>
      db.supplier.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      }),
    [],
  );

  return (
    <div>
      <PageHeader title="Suppliers" description="Supplier directory for material purchase." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Register supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.email ?? "—"}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{s.address ?? "—"}</TableCell>
                <TableCell>
                  <RowAction
                    action={deleteSupplier}
                    name="id"
                    value={s.id}
                    label="Remove"
                    confirm="Remove this supplier?"
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
