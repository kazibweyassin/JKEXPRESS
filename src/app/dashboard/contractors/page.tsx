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
import { HardHat, Mail } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

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
  const contractorsWithEmail = contractors.filter((contractor) => contractor.email).length;

  return (
    <div>
      <PageHeader
        title="Subcontractors"
        description="External works packages. Assign them to a project; do not add their workers to Employees."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard title="Subcontractors" value={contractors.length} icon={HardHat} subtitle="External delivery partners" />
        <StatCard title="Contactable" value={contractorsWithEmail} icon={Mail} subtitle="Subcontractors with email" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Register subcontractor</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractorForm />
        </CardContent>
      </Card>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table className="min-w-[700px]">
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
