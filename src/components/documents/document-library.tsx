"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RowAction } from "@/components/forms/form-frame";
import { deleteDocument } from "@/app/actions/directory";
import { formatDate, statusLabel } from "@/lib/utils";

type LibraryDocument = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  category: string;
  createdAt: string;
  projectName: string | null;
  propertyName: string | null;
  uploadedByName: string | null;
};

export function DocumentLibrary({ documents, categories, projects, canDelete = true }: {
  documents: LibraryDocument[];
  categories: string[];
  projects: Array<{ id: string; label: string }>;
  canDelete?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [project, setProject] = useState("ALL");
  const [page, setPage] = useState(1);
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedProject = projects.find((item) => item.id === project)?.label;
    return documents.filter((document) => {
      const matchesQuery = !normalizedQuery || [document.title, document.fileName, document.projectName, document.propertyName, document.uploadedByName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
      return matchesQuery && (category === "ALL" || document.category === category) && (project === "ALL" || document.projectName === selectedProject);
    });
  }, [category, documents, project, projects, query]);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const visibleDocuments = filteredDocuments.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = query || category !== "ALL" || project !== "ALL";
  function clearFilters() {
    setQuery("");
    setCategory("ALL");
    setProject("ALL");
    setPage(1);
  }

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, filename, project or uploader" className="pl-9" aria-label="Search documents" />
      </div>
      <Select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filter by category" className="lg:w-48">
        <option value="ALL">All categories</option>
        {categories.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
      </Select>
      <Select value={project} onChange={(event) => { setProject(event.target.value); setPage(1); }} aria-label="Filter by project" className="lg:w-64">
        <option value="ALL">All projects</option>
        {projects.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </Select>
      {hasFilters ? <Button type="button" variant="ghost" onClick={clearFilters}><X className="mr-2 h-4 w-4" />Clear</Button> : null}
    </div>
    <div className="flex items-center justify-between gap-3 text-sm text-slate-500"><p>Showing {filteredDocuments.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredDocuments.length)} of {filteredDocuments.length} matching documents</p>{pageCount > 1 ? <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs">Page {page} of {pageCount}</span><Button type="button" variant="outline" size="sm" aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight className="h-4 w-4" /></Button></div> : null}</div>
    {filteredDocuments.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center"><FileText className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 font-medium text-slate-700">No matching documents</p><p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p></div> :
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table className="min-w-[820px]">
          <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Category</TableHead><TableHead>Related to</TableHead><TableHead>Uploaded by</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{visibleDocuments.map((document) => <TableRow key={document.id}>
            <TableCell className="min-w-[240px]"><a href={document.fileUrl} className="flex items-center gap-3 text-navy-800 hover:underline" target="_blank" rel="noreferrer"><span className="rounded-md bg-navy-50 p-2"><FileText className="h-4 w-4 text-navy-700" /></span><span><span className="block font-medium">{document.title}</span><span className="block max-w-[220px] truncate text-xs text-slate-500">{document.fileName}</span></span></a></TableCell>
            <TableCell><Badge variant="secondary">{statusLabel(document.category)}</Badge></TableCell>
            <TableCell className="max-w-[220px] truncate text-xs">{document.projectName ?? document.propertyName ?? "General library"}</TableCell>
            <TableCell className="text-xs">{document.uploadedByName ?? "—"}</TableCell>
            <TableCell className="whitespace-nowrap text-xs">{formatDate(document.createdAt)}</TableCell>
            <TableCell>{canDelete ? <RowAction action={deleteDocument} name="id" value={document.id} label="Remove" confirm="Remove this document from the register?" /> : <span className="text-xs text-slate-400">View only</span>}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </div>}
  </div>;
}