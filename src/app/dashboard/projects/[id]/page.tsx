import Link from "next/link";
import { notFound } from "next/navigation";
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
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import {
  AssignEmployeeForm,
  AssignSubcontractorForm,
  ProjectPlanItemForm,
  BoqForm,
  SiteDiaryForm,
  VariationOrderForm,
} from "@/components/forms/construction-forms";

export default async function ProjectDetailDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("projects");
  const { id } = await params;
  const project = await db.constructionProject.findFirst({
    where: { id, deletedAt: null },
    include: {
      projectManager: { include: { user: true } },
      phases: { orderBy: { sortOrder: "asc" } },
      milestones: true,
      tasks: {
        include: { assignee: true },
        orderBy: { updatedAt: "desc" },
      },
      siteReports: {
        orderBy: { reportDate: "desc" },
        take: 5,
        include: { submittedBy: true, photos: true },
      },
      teamMembers: {
        include: { employee: { include: { user: true } } },
      },
      subcontracts: { include: { contractor: true } },
      weeklyReports: {
        orderBy: { weekStarting: "desc" },
        take: 6,
        include: { enteredBy: true, contractor: true },
      },
      expenses: { orderBy: { expenseDate: "desc" }, take: 8 },
      boqs: { include: { items: true }, orderBy: { updatedAt: "desc" } },
      variations: { orderBy: { createdAt: "desc" } },
      purchaseRequests: { include: { items: true }, orderBy: { createdAt: "desc" }, take: 10 },
      contracts: { include: { ipcs: true } },
    },
  });
  if (!project) notFound();

  const [employees, contractors] = await Promise.all([
    db.employee.findMany({
      where: { deletedAt: null, employmentStatus: "ACTIVE" },
      include: { user: true },
      orderBy: { employeeCode: "asc" },
    }),
    db.contractor.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const boqBudget = project.boqs.reduce((sum, boq) => sum + boq.items.reduce((itemSum, item) => itemSum + Number(item.estimatedTotal), 0), 0);
  const boqActual = project.boqs.reduce((sum, boq) => sum + boq.items.reduce((itemSum, item) => itemSum + Number(item.actualCost ?? 0), 0), 0);
  const approvedVariations = project.variations.filter((variation) => variation.status === "APPROVED").reduce((sum, variation) => sum + Number(variation.amount), 0);
  const certifiedValue = project.contracts.reduce((sum, contract) => sum + contract.ipcs.reduce((ipcSum, ipc) => ipcSum + Number(ipc.grossAmount), 0), 0);

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`${project.code} · ${project.location ?? project.city ?? ""}`}
        actions={
          <Link href="/dashboard/projects" className="text-sm text-navy-700 hover:underline">
            ← Projects
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant={statusVariant(project.status)}>
          {statusLabel(project.status)}
        </Badge>
        <Badge variant="secondary">{project.completionPercentage}% complete</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Contract value</p>
            <p className="mt-1 font-bold">
              {project.contractValue
                ? formatCurrency(Number(project.contractValue))
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Budget</p>
            <p className="mt-1 font-bold">
              {project.approvedBudget
                ? formatCurrency(Number(project.approvedBudget))
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Expenditure</p>
            <p className="mt-1 font-bold">
              {formatCurrency(Number(project.currentExpenditure))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Project manager</p>
            <p className="mt-1 font-bold">
              {project.projectManager?.user.name ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.phases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm"
                >
                  <span>{p.name}</span>
                  <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.milestones.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p>{m.name}</p>
                    <p className="text-xs text-slate-400">Due {formatDate(m.dueDate)}</p>
                  </div>
                  <Badge variant={statusVariant(m.status)}>{statusLabel(m.status)}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Programme control</CardTitle></CardHeader>
        <CardContent><ProjectPlanItemForm projectId={project.id} /></CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.assignee?.name ?? "—"}</TableCell>
                  <TableCell>{statusLabel(task.priority)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(task.status)}>
                      {statusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Daily site diary</CardTitle></CardHeader>
          <CardContent><SiteDiaryForm projectId={project.id} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Raise variation</CardTitle></CardHeader>
          <CardContent><VariationOrderForm projectId={project.id} /></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">BOQ and cost baseline</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <BoqForm projectId={project.id} />
          {project.boqs.map((boq) => <div key={boq.id} className="rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="font-semibold">{boq.title}</p><p className="text-xs text-slate-500">Version {boq.version} · {statusLabel(boq.status)}</p></div><p className="font-semibold">{formatCurrency(boq.items.reduce((sum, item) => sum + Number(item.estimatedTotal), 0))}</p></div>
            <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Description</TableHead><TableHead>Qty</TableHead><TableHead>Rate</TableHead><TableHead>Total</TableHead><TableHead>Actual</TableHead></TableRow></TableHeader><TableBody>{boq.items.map((item) => <TableRow key={item.id}><TableCell className="font-mono text-xs">{item.itemNumber}</TableCell><TableCell><div>{item.description}</div><div className="text-xs text-slate-400">{item.section}</div></TableCell><TableCell>{Number(item.estimatedQuantity)} {item.unit}</TableCell><TableCell>{formatCurrency(Number(item.unitRate))}</TableCell><TableCell>{formatCurrency(Number(item.estimatedTotal))}</TableCell><TableCell>{formatCurrency(Number(item.actualCost ?? 0))}</TableCell></TableRow>)}</TableBody></Table>
          </div>)}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Commercial control</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[['BOQ baseline', boqBudget], ['BOQ actual', boqActual], ['Approved variations', approvedVariations], ['Certified work', certifiedValue]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-slate-100 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold">{formatCurrency(Number(value))}</p></div>)}
          </div>
          <Table><TableHeader><TableRow><TableHead>Variation</TableHead><TableHead>Value</TableHead><TableHead>EOT</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{project.variations.map((variation) => <TableRow key={variation.id}><TableCell><div className="font-medium">{variation.title}</div><div className="text-xs text-slate-500">{variation.variationNumber}</div></TableCell><TableCell>{formatCurrency(Number(variation.amount))}</TableCell><TableCell>{variation.extensionDays} days</TableCell><TableCell><Badge variant={statusVariant(variation.status)}>{statusLabel(variation.status)}</Badge></TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Project procurement</CardTitle></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Request</TableHead><TableHead>Items</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{project.purchaseRequests.map((request) => <TableRow key={request.id}><TableCell><div className="font-medium">{request.title}</div><div className="text-xs text-slate-500">{request.requestNumber}</div></TableCell><TableCell>{request.items.length}</TableCell><TableCell><Badge variant={statusVariant(request.status)}>{statusLabel(request.status)}</Badge></TableCell><TableCell>{formatDate(request.createdAt)}</TableCell></TableRow>)}</TableBody></Table></CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent site reports</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {project.siteReports.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">{formatDate(r.reportDate)}</span>
                  <Badge variant="secondary">{statusLabel(r.status)}</Badge>
                </div>
                <p className="mt-1 text-slate-600 line-clamp-2">{r.workCompleted}</p>
                <p className="mt-1 text-xs text-slate-400">
                  By {r.submittedBy.name} · {r.workersPresent ?? 0} workers
                </p>
              </li>
            ))}
            {project.siteReports.length === 0 ? (
              <li className="py-6 text-center text-slate-500">No site reports yet</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              JK Express employees only. Subcontractor labour is not recorded here.
            </p>
            <ul className="space-y-2 text-sm">
              {project.teamMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
                >
                  <span>{member.employee.user.name}</span>
                  <Badge variant="secondary">{statusLabel(member.role)}</Badge>
                </li>
              ))}
              {project.teamMembers.length === 0 ? (
                <li className="text-slate-500">No company staff assigned.</li>
              ) : null}
            </ul>
            <AssignEmployeeForm
              projectId={project.id}
              employees={employees.map((e) => ({
                id: e.id,
                label: `${e.employeeCode} — ${e.user.name}`,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subcontractors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {project.subcontracts.map((sub) => (
                <li
                  key={sub.id}
                  className="rounded-md border border-slate-100 px-3 py-2"
                >
                  <p className="font-medium">{sub.contractor.name}</p>
                  <p className="text-xs text-slate-500">
                    {sub.packageName}
                    {sub.contractSum
                      ? ` · ${formatCurrency(Number(sub.contractSum), sub.currency)}`
                      : ""}
                  </p>
                </li>
              ))}
              {project.subcontracts.length === 0 ? (
                <li className="text-slate-500">No packages awarded.</li>
              ) : null}
            </ul>
            <AssignSubcontractorForm
              projectId={project.id}
              contractors={contractors.map((c) => ({ id: c.id, label: c.name }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Weekly progress (FIDIC)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {project.weeklyReports.map((report) => (
              <li key={report.id} className="py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">
                    Week of {formatDate(report.weekStarting)}
                  </span>
                  <span>{report.progressPercent ?? "—"}%</span>
                </div>
                <p className="mt-1 text-slate-600 line-clamp-2">
                  {report.workCompleted}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Entered by {report.enteredBy.name}
                  {report.contractor ? ` · from ${report.contractor.name}` : ""}
                </p>
              </li>
            ))}
            {project.weeklyReports.length === 0 ? (
              <li className="py-4 text-slate-500">No weekly reports yet.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Project financials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-xs">{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell>{statusLabel(expense.category)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {formatCurrency(Number(expense.amount), expense.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
