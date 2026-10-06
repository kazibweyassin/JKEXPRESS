import Link from "next/link";
import { CheckCircle2, Clock3, HardHat, PauseCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/forms/construction-forms";
import { hasSessionPermission, requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string; removed?: string }>;
}) {
  const session = await requirePagePermission("projects");
  const canEdit = hasSessionPermission(session, "projects", "edit");
  const canDelete = canEdit || hasSessionPermission(session, "projects", "delete");
  const filters = await searchParams;
  const statusFilter = ["ALL", "PLANNING", "AWAITING_APPROVAL", "ACTIVE", "ON_HOLD", "DELAYED", "COMPLETED", "CANCELLED"].includes(filters?.status ?? "") ? filters?.status : "ALL";
  const query = filters?.q?.trim() ?? "";

  const projects = await safeQuery(
    () =>
      db.constructionProject.findMany({
        where: {
          deletedAt: null,
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { code: { contains: query, mode: "insensitive" } }, { clientName: { contains: query, mode: "insensitive" } }] } : {}),
        },
        include: {
          projectManager: {
            include: { user: { select: { name: true } } },
          },
      },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
    [],
  );
  const activeCount = projects.filter((project) => project.status === "ACTIVE").length;
  const planningCount = projects.filter((project) => project.status === "PLANNING").length;
  const completedCount = projects.filter((project) => project.status === "COMPLETED").length;
  const pausedCount = projects.filter((project) => ["ON_HOLD", "DELAYED"].includes(project.status)).length;

  return (
    <div>
      <PageHeader
        title="Construction projects"
        description="Projects, company team, subcontract packages, financials and weekly FIDIC progress."
        actions={<Link href="/dashboard/projects/new" className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">New project</Link>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="All projects" value={projects.length} icon={HardHat} subtitle="Current portfolio" />
        <StatCard title="Active" value={activeCount} icon={CheckCircle2} subtitle="In delivery" tone={activeCount ? "success" : "default"} />
        <StatCard title="Planning" value={planningCount} icon={Clock3} subtitle="Awaiting mobilisation" />
        <StatCard title="Paused or delayed" value={pausedCount} icon={PauseCircle} subtitle={`${completedCount} completed`} tone={pausedCount ? "warning" : "default"} />
      </div>

      {filters?.removed === "1" ? (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Project deleted. It no longer appears in the list.
        </p>
      ) : null}

      <form className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end" method="get">
        <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">Search projects<input name="q" defaultValue={query} placeholder="Name, code or client" className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" /></label>
        <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={statusFilter} className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 sm:w-44"><option value="ALL">All statuses</option><option value="PLANNING">Planning</option><option value="AWAITING_APPROVAL">Awaiting approval</option><option value="ACTIVE">Active</option><option value="ON_HOLD">On hold</option><option value="DELAYED">Delayed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label>
        <button type="submit" className="h-10 rounded-md bg-navy-900 px-4 text-sm font-medium text-white hover:bg-navy-800">Filter</button>
        {query || statusFilter !== "ALL" ? <Link href="/dashboard/projects" className="h-10 px-2 py-2 text-sm text-navy-700 hover:underline">Clear</Link> : null}
      </form>

      {projects.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No projects yet"
          description="Construction projects will appear here."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  {canEdit || canDelete ? <TableHead>Actions</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="min-w-[240px]">
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="font-medium text-navy-900 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500">{p.code}</div>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{p.clientName ?? "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs">
                      {p.projectManager?.user?.name ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-navy-700"
                            style={{
                              width: `${Math.min(100, p.completionPercentage)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">{Math.round(p.completionPercentage)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.approvedBudget != null
                        ? formatCurrency(Number(p.approvedBudget))
                        : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatDate(p.expectedCompletion)}
                    </TableCell>
                    {canEdit || canDelete ? (
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-2">
                          {canEdit ? (
                            <Link href={`/dashboard/projects/${p.id}/edit`} className="text-sm font-medium text-navy-800 hover:underline">
                              Edit
                            </Link>
                          ) : null}
                          {canDelete ? <DeleteProjectButton projectId={p.id} projectName={p.name} /> : null}
                        </div>
                      </TableCell>
                    ) : null}
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
