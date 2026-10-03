import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentForm } from "@/components/forms/directory-forms";
import { DocumentLibrary } from "@/components/documents/document-library";
import { StatCard } from "@/components/ui/stat-card";
import { requirePagePermission } from "@/lib/auth-guard";
import { hasSessionPermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { FileStack, FolderOpen, FileText } from "lucide-react";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const session = await requirePagePermission("documents");
  const canUpload = hasSessionPermission(session, "documents", "create");
  const canDelete = hasSessionPermission(session, "documents", "edit");
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
  const categoryCounts = documents.reduce<Record<string, number>>((counts, document) => {
    counts[document.category] = (counts[document.category] ?? 0) + 1;
    return counts;
  }, {});
  const libraryDocuments = documents.map((document) => ({
    id: document.id,
    title: document.title,
    fileUrl: document.fileUrl,
    fileName: document.fileName,
    category: document.category,
    createdAt: document.createdAt.toISOString(),
    projectName: document.project?.name ?? null,
    propertyName: document.property?.title ?? null,
    uploadedByName: document.uploadedBy?.name ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Documents"
        description="One searchable library for contracts, reports, IPCs, permits and project files."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="All documents" value={documents.length} icon={FileStack} subtitle="Latest 100 files" />
        <StatCard title="Reports" value={categoryCounts.REPORT ?? 0} icon={FileText} subtitle="Progress and site reports" />
        <StatCard title="Contracts & IPCs" value={(categoryCounts.CONTRACT ?? 0) + (categoryCounts.INVOICE ?? 0)} icon={FolderOpen} subtitle="Commercial records" />
      </div>
      {canUpload ? <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            properties={properties.map((item) => ({ id: item.id, label: item.title }))}
            projects={projects.map((item) => ({ id: item.id, label: `${item.code} — ${item.name}` }))}
          />
        </CardContent>
      </Card> : <p className="mb-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">You have view-only access to the document library.</p>}
      <DocumentLibrary
        documents={libraryDocuments}
        categories={Object.keys(categoryCounts)}
        projects={projects.map((project) => ({ id: project.id, label: `${project.code} — ${project.name}` }))}
        canDelete={canDelete}
      />
    </div>
  );
}
