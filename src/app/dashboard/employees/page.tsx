import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeForm, EmployeeStatusForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteEmployee } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Employees" };

export default async function EmployeesPage() {
  await requirePagePermission("employees");
  const [employees, roles, departments] = await Promise.all([
    safeQuery(
      () =>
        db.employee.findMany({
          where: { deletedAt: null },
          include: {
            user: { include: { role: true } },
            department: true,
          },
          orderBy: { employeeCode: "asc" },
        }),
      [],
    ),
    safeQuery(() => db.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), []),
    safeQuery(() => db.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), []),
  ]);

  const roleOptions = roles.map((role) => ({ id: role.id, label: role.name }));
  const departmentOptions = departments.map((dept) => ({ id: dept.id, label: dept.name }));

  return (
    <div>
      <PageHeader
        title="Company employees"
        description="JK Express staff only. Subcontractor labour is not recorded as employees."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add employee</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm roles={roleOptions} departments={departmentOptions} />
        </CardContent>
      </Card>
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role / status</TableHead>
              <TableHead>Hired</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-mono text-xs">{employee.employeeCode}</TableCell>
                <TableCell className="font-medium">{employee.user.name}</TableCell>
                <TableCell>{employee.jobTitle ?? "—"}</TableCell>
                <TableCell>{employee.department?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(employee.employmentStatus)}>
                    {statusLabel(employee.employmentStatus)}
                  </Badge>
                  <div className="mt-2">
                    <EmployeeStatusForm
                      id={employee.id}
                      status={employee.employmentStatus}
                      roles={roleOptions}
                      roleId={employee.user.roleId}
                    />
                  </div>
                </TableCell>
                <TableCell>{formatDate(employee.hireDate)}</TableCell>
                <TableCell>
                  <RowAction
                    action={deleteEmployee}
                    name="id"
                    value={employee.id}
                    label="Deactivate"
                    confirm="Deactivate this employee login?"
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
