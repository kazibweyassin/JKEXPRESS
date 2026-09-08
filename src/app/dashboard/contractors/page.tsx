import { PageHeader } from "@/components/ui/page-header";
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

export const metadata = { title: "Contractors" };

export default async function ContractorsPage() {
  await requirePagePermission("contractors");
  const contractors = await db.contractor.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Subcontractors"
        description="External works packages. Assign them to a project; do not add their workers to Employees."
      />
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.specialty ?? "—"}</TableCell>
                <TableCell>{c.email ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
