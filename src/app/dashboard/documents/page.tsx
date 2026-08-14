import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatDate, statusLabel } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requirePagePermission("documents");
  const documents = await db.document.findMany({
    where: { deletedAt: null },
    include: { uploadedBy: true, property: true, project: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Central document register (uploads use local/object storage)."
      />
      {documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents yet"
          description="Uploaded contracts, permits and reports will appear here."
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{statusLabel(doc.category)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {doc.property?.title ?? doc.project?.name ?? "—"}
                  </TableCell>
                  <TableCell>{doc.uploadedBy?.name ?? "—"}</TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
