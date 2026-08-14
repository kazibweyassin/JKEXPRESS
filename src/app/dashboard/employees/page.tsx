import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Employees" };

export default async function EmployeesPage() {
  await requirePagePermission("employees");
  const employees = await db.employee.findMany({
    where: { deletedAt: null },
    include: {
      user: { include: { role: true } },
      department: true,
    },
    orderBy: { employeeCode: "asc" },
  });

  return (
    <div>
      <PageHeader title="Employees" description="Staff directory and employment status." />
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hired</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.employeeCode}</TableCell>
                <TableCell className="font-medium">{e.user.name}</TableCell>
                <TableCell>{e.jobTitle ?? "—"}</TableCell>
                <TableCell>{e.department?.name ?? "—"}</TableCell>
                <TableCell>{e.user.role.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(e.employmentStatus)}>
                    {statusLabel(e.employmentStatus)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(e.hireDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
