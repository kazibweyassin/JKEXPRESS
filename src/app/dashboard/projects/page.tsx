import Link from "next/link";
import { HardHat } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requirePagePermission("projects");

  const projects = await db.constructionProject.findMany({
    where: { deletedAt: null },
    include: {
      projectManager: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Construction projects"
        description="Active and completed construction work."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No projects yet"
          description="Construction projects will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="font-medium text-navy-900 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-slate-500">{p.code}</div>
                    </TableCell>
                    <TableCell className="text-xs">{p.clientName ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {p.projectManager?.user?.name ?? "—"}
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(p.expectedCompletion)}
                    </TableCell>
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
