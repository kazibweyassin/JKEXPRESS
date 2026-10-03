import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteDocument, restoreDocument } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export const metadata = { title: "Weekly progress" };

export default async function WeeklyProgressPage() {
  await requirePagePermission("projects");
  const recoveryCutoff = new Date();
  recoveryCutoff.setDate(recoveryCutoff.getDate() - 30);

  const [reports, deletedReports, projects] = await Promise.all([
    safeQuery(
      () =>
        db.document.findMany({
          where: { deletedAt: null, category: "REPORT" },
          include: {
            project: true,
            uploadedBy: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      [],
    ),
    safeQuery(
      () => db.document.findMany({
        where: { category: "REPORT", deletedAt: { gte: recoveryCutoff } },
        include: { project: true, uploadedBy: true },
        orderBy: { deletedAt: "desc" },
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
  ]);

  return (
    <div>
      <PageHeader
        title="Weekly progress reports"
        description="Upload completed weekly progress reports for the project record."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Upload a progress report</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            properties={[]}
            projects={projects.map((p) => ({ id: p.id, label: `${p.code} — ${p.name}` }))}
            reportOnly
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uploaded reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500"><FileText className="h-8 w-8" /><p>No progress reports uploaded yet.</p></div> :
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Uploaded by</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium"><a href={report.fileUrl} target="_blank" rel="noreferrer" className="text-navy-800 hover:underline">{report.title}</a></TableCell>
                    <TableCell>{report.project?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{report.uploadedBy?.name ?? "—"}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell><RowAction action={deleteDocument} name="id" value={report.id} label="Remove" confirm="Remove this uploaded report?" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
      {deletedReports.length ? <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Deleted reports · recoverable for 30 days</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Report</TableHead><TableHead>Project</TableHead><TableHead>Deleted</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{deletedReports.map((report) => <TableRow key={report.id}>
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>{report.project?.name ?? "—"}</TableCell>
              <TableCell>{report.deletedAt ? formatDate(report.deletedAt) : "—"}</TableCell>
              <TableCell><RowAction action={restoreDocument} name="id" value={report.id} label="Recover" confirm="Recover this report?" /></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card> : null}
    </div>
  );
}
