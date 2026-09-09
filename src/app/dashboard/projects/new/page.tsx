import Link from "next/link";
import { ConstructionProjectForm } from "@/components/forms/construction-forms";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";

export const metadata = { title: "New construction project" };

export default async function NewConstructionProjectPage() {
  await requirePagePermission("projects", "create");
  const managers = await safeQuery(
    () =>
      db.employee.findMany({
        where: { deletedAt: null, employmentStatus: "ACTIVE" },
        include: { user: true },
        orderBy: { employeeCode: "asc" },
      }),
    [],
  );
  return <div>
    <PageHeader title="Set up construction project" description="Create the commercial and programme baseline before site operations begin." actions={<Link href="/dashboard/projects" className="text-sm text-navy-700 hover:underline">← Projects</Link>} />
    <Card><CardContent className="p-6"><ConstructionProjectForm managers={managers.map((m) => ({ id: m.id, label: `${m.employeeCode} — ${m.user.name}` }))} /></CardContent></Card>
  </div>;
}
