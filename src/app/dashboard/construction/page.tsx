import Link from "next/link";
import { ClipboardCheck, FileWarning, HardHat, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePagePermission } from "@/lib/auth-guard";
import { mondayOf } from "@/lib/construction-standards";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatCurrency, formatDateTime, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Construction overview" };

export default async function ConstructionOverviewPage() {
  await requirePagePermission("projects");
  const now = new Date();
  const [projects, activeProjects, planningProjects, completedProjects, constructionSpend, unpaidIpcs, missingWeeklyReports] = await Promise.all([
    safeQuery(() => db.constructionProject.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true, status: true, completionPercentage: true, approvedBudget: true, currentExpenditure: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }), []),
    safeQuery(() => db.constructionProject.count({ where: { status: "ACTIVE", deletedAt: null } }), 0),
    safeQuery(() => db.constructionProject.count({ where: { status: "PLANNING", deletedAt: null } }), 0),
    safeQuery(() => db.constructionProject.count({ where: { status: "COMPLETED", deletedAt: null } }), 0),
    safeQuery(() => db.constructionProject.aggregate({
      _sum: { approvedBudget: true, currentExpenditure: true },
      where: { deletedAt: null },
    }), { _sum: { approvedBudget: null, currentExpenditure: null } }),
    safeQuery(() => db.interimPaymentCertificate.count({ where: { status: "CERTIFIED" } }), 0),
    safeQuery(() => db.constructionProject.count({
      where: {
        deletedAt: null,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        weeklyReports: { none: { weekStarting: mondayOf(now) } },
      },
    }), 0),
  ]);

  return <div>
    <PageHeader title="Construction overview" description="A quick operational snapshot of projects, delivery progress, spend and reporting." />
    <p className="-mt-4 mb-5 text-xs text-slate-500">Last refreshed {formatDateTime(now)}</p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Projects" value={projects.length} icon={HardHat} subtitle={`${activeProjects} active · ${planningProjects} planning`} href="/dashboard/projects" />
      <StatCard title="Completed" value={completedProjects} icon={ClipboardCheck} href="/dashboard/projects" />
      <StatCard title="Construction spend" value={formatCurrency(Number(constructionSpend._sum.currentExpenditure ?? 0))} icon={Wallet} subtitle={constructionSpend._sum.approvedBudget ? `of ${formatCurrency(Number(constructionSpend._sum.approvedBudget))} budget` : "No approved budget recorded"} href="/dashboard/projects" />
      <StatCard title="Missing weekly reports" value={missingWeeklyReports} icon={FileWarning} subtitle="Non-completed projects" tone={missingWeeklyReports > 0 ? "warning" : "success"} href="/dashboard/progress" />
      <StatCard title="IPCs awaiting payment" value={unpaidIpcs} icon={Wallet} subtitle="Certified payment certificates" tone={unpaidIpcs > 0 ? "warning" : "success"} href="/dashboard/contracts" />
    </div>
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Project delivery</CardTitle><Link href="/dashboard/projects" className="text-sm text-navy-700 hover:underline">Open all projects</Link></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Progress</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{projects.map((project) => <TableRow key={project.id}>
            <TableCell><Link href={`/dashboard/projects/${project.id}`} className="font-medium text-navy-900 hover:underline">{project.name}</Link><div className="text-xs text-slate-500">{project.code}</div></TableCell>
            <TableCell>{Math.round(project.completionPercentage)}%</TableCell>
            <TableCell className="text-xs">{project.approvedBudget != null ? formatCurrency(Number(project.approvedBudget)) : "—"}</TableCell>
            <TableCell className="text-xs">{formatCurrency(Number(project.currentExpenditure))}</TableCell>
            <TableCell><Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge></TableCell>
          </TableRow>)}{projects.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">No construction projects yet.</TableCell></TableRow> : null}</TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>;
}