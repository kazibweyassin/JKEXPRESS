import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteDocument } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { FileText } from "lucide-react";

export const metadata = { title: "Contracts & IPCs" };

export default async function ContractsPage() {
  await requirePagePermission("projects");

  const [documents, projects] = await Promise.all([
    safeQuery(
      () => db.document.findMany({
        where: { deletedAt: null, category: { in: ["CONTRACT", "INVOICE"] } },
        include: { project: true, uploadedBy: true },
        orderBy: { createdAt: "desc" },
        take: 100,
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
      <PageHeader title="Contracts & IPCs" description="Upload signed contracts and Interim Payment Certificates for the project record." />
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Upload contract or IPC</CardTitle></CardHeader>
        <CardContent>
          <DocumentForm
            properties={[]}
            projects={projects.map((project) => ({ id: project.id, label: `${project.code} — ${project.name}` }))}
            categoryOptions={[{ value: "CONTRACT", label: "Contract" }, { value: "INVOICE", label: "IPC / payment certificate" }]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Uploaded contracts and IPCs</CardTitle></CardHeader>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500"><FileText className="h-8 w-8" /><p>No contracts or IPCs uploaded yet.</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Project</TableHead><TableHead>Uploaded by</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium"><a href={document.fileUrl} target="_blank" rel="noreferrer" className="text-navy-800 hover:underline">{document.title}</a></TableCell>
                    <TableCell><Badge variant="secondary">{statusLabel(document.category)}</Badge></TableCell>
                    <TableCell>{document.project?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{document.uploadedBy?.name ?? "—"}</TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell><RowAction action={deleteDocument} name="id" value={document.id} label="Remove" confirm="Remove this uploaded document?" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
