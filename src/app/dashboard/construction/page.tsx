import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileWarning, HardHat, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth-guard";
import { mondayOf } from "@/lib/construction-standards";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDate, formatDateTime, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Construction overview" };

const statuses = ["ALL", "PLANNING", "AWAITING_APPROVAL", "ACTIVE", "ON_HOLD", "DELAYED", "COMPLETED", "CANCELLED"] as const;

export default async function ConstructionOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string; manager?: string }>;
}) {
  await requirePagePermission("projects");
  const now = new Date();
  const filters = await searchParams;
  const statusFilter = statuses.includes(filters?.status as (typeof statuses)[number]) ? filters?.status : "ALL";
  const query = filters?.q?.trim() ?? "";
  const managerFilter = filters?.manager?.trim() ?? "";
  const projectWhere = {
    deletedAt: null,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(managerFilter ? { projectManagerId: managerFilter } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { code: { contains: query, mode: "insensitive" as const } },
            { clientName: { contains: query, mode: "insensitive" as const } },
            { location: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const activeWhere = { deletedAt: null, status: "ACTIVE" };
  const openWhere = { deletedAt: null, status: { notIn: ["COMPLETED", "CANCELLED"] } };

  const [
    projects,
    totalProjects,
    activeProjects,
    planningProjects,
    completedProjects,
    constructionSpend,
    unpaidIpcs,
    missingWeeklyReports,
    overdueProjects,
    overdueMilestones,
    managers,
  ] = await Promise.all([
    safeQuery(
      () =>
        db.constructionProject.findMany({
          where: projectWhere,
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            completionPercentage: true,
            approvedBudget: true,
            currentExpenditure: true,
            expectedCompletion: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
        }),
      [],
    ),
    safeQuery(() => db.constructionProject.count({ where: { deletedAt: null } }), 0),
    safeQuery(() => db.constructionProject.count({ where: activeWhere }), 0),
    safeQuery(() => db.constructionProject.count({ where: { deletedAt: null, status: "PLANNING" } }), 0),
    safeQuery(() => db.constructionProject.count({ where: { deletedAt: null, status: "COMPLETED" } }), 0),
    safeQuery(
      () =>
        db.constructionProject.aggregate({
          _sum: { approvedBudget: true, currentExpenditure: true },
          where: { deletedAt: null },
        }),
      { _sum: { approvedBudget: null, currentExpenditure: null } },
    ),
    safeQuery(
      () => db.interimPaymentCertificate.count({ where: { status: "CERTIFIED" } }),
      0,
    ),
    safeQuery(
      () =>
        db.constructionProject.count({
          where: {
            ...openWhere,
            weeklyReports: { none: { weekStarting: mondayOf(now) } },
          },
        }),
      0,
    ),
    safeQuery(
      () =>
        db.constructionProject.count({
          where: {
            ...openWhere,
            expectedCompletion: { lt: now },
          },
        }),
      0,
    ),
    safeQuery(
      () =>
        db.projectMilestone.count({
          where: {
            dueDate: { lt: now },
            completedAt: null,
            project: openWhere,
          },
        }),
      0,
    ),
    safeQuery(
      () =>
        db.employee.findMany({
          where: { deletedAt: null, employmentStatus: "ACTIVE", managedProjects: { some: { deletedAt: null } } },
          include: { user: { select: { name: true } } },
          orderBy: { employeeCode: "asc" },
        }),
      [],
    ),
  ]);

  const approvedBudget = Number(constructionSpend._sum.approvedBudget ?? 0);
  const expenditure = Number(constructionSpend._sum.currentExpenditure ?? 0);
  const budgetRemaining = approvedBudget - expenditure;
  const budgetUsedPercent = approvedBudget > 0 ? Math.round((expenditure / approvedBudget) * 100) : null;

  return (
    <div>
      <PageHeader title="Construction overview" description="A quick operational snapshot of projects, delivery progress, spend and reporting." />
      <p className="-mt-4 mb-5 text-xs text-slate-500">Last refreshed {formatDateTime(now)}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Projects" value={totalProjects} icon={HardHat} subtitle={`${activeProjects} active · ${planningProjects} planning`} href="/dashboard/projects" />
        <StatCard title="Completed" value={completedProjects} icon={ClipboardCheck} href="/dashboard/projects?status=COMPLETED" />
        <StatCard title="Construction spend" value={formatCurrency(expenditure)} icon={Wallet} subtitle={approvedBudget > 0 ? `${budgetUsedPercent}% of ${formatCurrency(approvedBudget)} budget` : "No approved budget recorded"} href="/dashboard/projects" />
        <StatCard title="Budget remaining" value={approvedBudget > 0 ? formatCurrency(budgetRemaining) : "—"} icon={Wallet} subtitle={budgetRemaining < 0 ? "Portfolio is over budget" : "Approved budget less expenditure"} tone={budgetRemaining < 0 ? "warning" : "default"} href="/dashboard/reports" />
        <StatCard title="Schedule risks" value={overdueProjects + overdueMilestones} icon={AlertTriangle} subtitle={`${overdueProjects} projects · ${overdueMilestones} milestones overdue`} tone={overdueProjects + overdueMilestones > 0 ? "warning" : "success"} href="/dashboard/projects" />
        <StatCard title="Missing weekly reports" value={missingWeeklyReports} icon={FileWarning} subtitle="Non-completed projects" tone={missingWeeklyReports > 0 ? "warning" : "success"} href="/dashboard/progress" />
        <StatCard title="IPCs awaiting payment" value={unpaidIpcs} icon={Wallet} subtitle="Certified, not paid" tone={unpaidIpcs > 0 ? "warning" : "success"} href="/dashboard/contracts" />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Project delivery</CardTitle>
            <Link href="/dashboard/projects" className="text-sm text-navy-700 hover:underline">Open all projects</Link>
          </div>
          <form className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-end" method="get">
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">Search
              <input name="q" defaultValue={query} placeholder="Name, code, client or location" className="mt-1 block h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">Status
              <select name="status" defaultValue={statusFilter} className="mt-1 block h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal sm:w-44">
                {statuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : statusLabel(status)}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Manager
              <select name="manager" defaultValue={managerFilter} className="mt-1 block h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal sm:w-52">
                <option value="">All managers</option>
                {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.employeeCode} — {manager.user.name}</option>)}
              </select>
            </label>
            <button type="submit" className="h-9 rounded-md bg-navy-900 px-4 text-sm font-medium text-white hover:bg-navy-800">Filter</button>
            {query || statusFilter !== "ALL" || managerFilter ? <Link href="/dashboard/construction" className="h-9 px-2 py-2 text-sm text-navy-700 hover:underline">Clear</Link> : null}
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Progress</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{projects.map((project) => {
              const isOverdue = project.expectedCompletion != null && project.expectedCompletion < now && !["COMPLETED", "CANCELLED"].includes(project.status);
              return <TableRow key={project.id}>
                <TableCell><Link href={`/dashboard/projects/${project.id}`} className="font-medium text-navy-900 hover:underline">{project.name}</Link><div className="text-xs text-slate-500">{project.code}</div></TableCell>
                <TableCell>{Math.round(project.completionPercentage)}%</TableCell>
                <TableCell className="text-xs">{project.approvedBudget != null ? formatCurrency(Number(project.approvedBudget)) : "—"}</TableCell>
                <TableCell className="text-xs">{formatCurrency(Number(project.currentExpenditure))}</TableCell>
                <TableCell className={`whitespace-nowrap text-xs ${isOverdue ? "font-semibold text-rose-700" : ""}`}>{formatDate(project.expectedCompletion)}{isOverdue ? " · overdue" : ""}</TableCell>
                <TableCell><Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge></TableCell>
              </TableRow>;
            })}{projects.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-slate-500">No construction projects match these filters.</TableCell></TableRow> : null}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
