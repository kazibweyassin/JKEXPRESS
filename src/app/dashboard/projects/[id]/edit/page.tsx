import Link from "next/link";
import { notFound } from "next/navigation";
import { ConstructionProjectForm } from "@/components/forms/construction-forms";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";

export const metadata = { title: "Edit construction project" };

function dateValue(value: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kampala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function moneyValue(value: { toString(): string } | null) {
  return value == null ? "" : value.toString();
}

export default async function EditConstructionProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("projects", "edit");
  const { id } = await params;
  const [project, managers] = await Promise.all([
    safeQuery(
      () =>
        db.constructionProject.findFirst({
          where: { id, deletedAt: null },
        }),
      null,
    ),
    safeQuery(
      () =>
        db.employee.findMany({
          where: { deletedAt: null, employmentStatus: "ACTIVE" },
          include: { user: true },
          orderBy: { employeeCode: "asc" },
        }),
      [],
    ),
  ]);
  if (!project) notFound();

  return (
    <div>
      <PageHeader
        title="Update project"
        description={`${project.code} · Change the commercial details or status without creating a new project.`}
        actions={
          <Link href={`/dashboard/projects/${project.id}`} className="text-sm text-navy-700 hover:underline">
            ← {project.name}
          </Link>
        }
      />
      <Card>
        <CardContent className="p-6">
          <ConstructionProjectForm
            managers={managers.map((manager) => ({
              id: manager.id,
              label: `${manager.employeeCode} — ${manager.user.name}`,
            }))}
            project={{
              id: project.id,
              code: project.code,
              name: project.name,
              procurementRefNo: project.procurementRefNo ?? "",
              description: project.description ?? "",
              clientName: project.clientName ?? "",
              projectManagerId: project.projectManagerId ?? "",
              supervisingConsultant: project.supervisingConsultant ?? "",
              contractor: project.contractor ?? "",
              location: project.location ?? "",
              city: project.city ?? "",
              contractCurrency: project.contractCurrency,
              contractValue: moneyValue(project.contractValue),
              amendedContractValue: moneyValue(project.amendedContractValue),
              approvedBudget: moneyValue(project.approvedBudget),
              contractSignatureDate: dateValue(project.contractSignatureDate),
              startDate: dateValue(project.startDate),
              expectedCompletion: dateValue(project.expectedCompletion),
              extendedCompletion: dateValue(project.extendedCompletion),
              status: project.status,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
