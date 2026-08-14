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
        include: { submittedBy: true },
      },
    },
  });
  if (!project) notFound();

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
    </div>
  );
}
