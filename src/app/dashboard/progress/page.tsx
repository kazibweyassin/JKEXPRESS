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
import { WeeklyProgressForm } from "@/components/forms/construction-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { PROGRESS_STANDARD } from "@/lib/construction-standards";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Weekly progress" };

export default async function WeeklyProgressPage() {
  await requirePagePermission("projects");

  const [reports, projects, contractors] = await Promise.all([
    safeQuery(
      () =>
        db.weeklyProgressReport.findMany({
          include: {
            project: true,
            enteredBy: true,
            contractor: true,
          },
          orderBy: { weekStarting: "desc" },
          take: 50,
        }),
      [],
    ),
    safeQuery(
      () =>
        db.constructionProject.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, code: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
    safeQuery(
      () =>
        db.contractor.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Weekly progress reports"
        description={`${PROGRESS_STANDARD.name}. ${PROGRESS_STANDARD.enteredBy} records the official week from ${PROGRESS_STANDARD.source.toLowerCase()}.`}
      />

      <div className="mb-6 rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-900">
        <p className="font-semibold">Chosen standard: {PROGRESS_STANDARD.short}</p>
        <p className="mt-1 text-navy-800">
          Subcontractors send weekly progress. They do not type into this register.
          The Site Engineer or Project Manager (JK Express employee) enters the
          report after site inspection. Subcontractor labour is not stored as
          company employees.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enter this week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyProgressForm
              projects={projects.map((p) => ({
                id: p.id,
                label: `${p.code} — ${p.name}`,
              }))}
              contractors={contractors.map((c) => ({ id: c.id, label: c.name }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent weeks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Entered by</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{formatDate(r.weekStarting)}</TableCell>
                    <TableCell className="font-medium">{r.project.name}</TableCell>
                    <TableCell>{r.progressPercent ?? "—"}</TableCell>
                    <TableCell className="text-xs">{r.enteredBy.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>
                        {statusLabel(r.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
