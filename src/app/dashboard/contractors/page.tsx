import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractorForm } from "@/components/forms/construction-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteContractor } from "@/app/actions/construction";
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

export const metadata = { title: "Contractors" };

export default async function ContractorsPage() {
  await requirePagePermission("contractors");
  const contractors = await safeQuery(
    () =>
      db.contractor.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      }),
    [],
  );

  return (
    <div>
      <PageHeader
        title="Subcontractors"
        description="External works packages. Assign them to a project; do not add their workers to Employees."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Register subcontractor</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractorForm />
        </CardContent>
      </Card>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.specialty ?? "—"}</TableCell>
                <TableCell>{c.email ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <RowAction
                    action={deleteContractor}
                    name="id"
                    value={c.id}
                    label="Remove"
                    confirm="Remove this subcontractor?"
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
