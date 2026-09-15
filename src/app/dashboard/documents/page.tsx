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
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentForm } from "@/components/forms/directory-forms";
import { RowAction } from "@/components/forms/form-frame";
import { deleteDocument } from "@/app/actions/directory";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate, statusLabel } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requirePagePermission("documents");
  const [documents, properties, projects] = await Promise.all([
    safeQuery(
      () =>
        db.document.findMany({
          where: { deletedAt: null },
          include: { uploadedBy: true, property: true, project: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      [],
    ),
    safeQuery(
      () => db.property.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
      [],
    ),
    safeQuery(
      () => db.constructionProject.findMany({ where: { deletedAt: null }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
      [],
    ),
  ]);

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Contracts, permits and reports are uploaded to Cloudflare R2. Click a title to open the file."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            properties={properties.map((item) => ({ id: item.id, label: item.title }))}
            projects={projects.map((item) => ({ id: item.id, label: `${item.code} — ${item.name}` }))}
          />
        </CardContent>
      </Card>
      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents yet"
          description="Upload a contract, permit or report and it will be stored in R2."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <a href={doc.fileUrl} className="text-navy-800 hover:underline" target="_blank" rel="noreferrer">
                      {doc.title}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{statusLabel(doc.category)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {doc.property?.title ?? doc.project?.name ?? "—"}
                  </TableCell>
                  <TableCell>{doc.uploadedBy?.name ?? "—"}</TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>
                    <RowAction
                      action={deleteDocument}
                      name="id"
                      value={doc.id}
                      label="Remove"
                      confirm="Remove this document from the register?"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
