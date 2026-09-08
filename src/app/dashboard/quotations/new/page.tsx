import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ClientQuotationForm } from "@/components/forms/construction-forms";
import { requirePagePermission } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export const metadata = { title: "New quotation" };

export default async function NewQuotationPage() {
  await requirePagePermission("projects");
  let projects: { id: string; name: string; code: string }[] = [];
  try {
    projects = await db.constructionProject.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });
  } catch {
    projects = [];
  }

  return (
    <div>
      <PageHeader
        title="New client quotation"
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <ClientQuotationForm
            projects={projects.map((p) => ({
              id: p.id,
              label: `${p.code} — ${p.name}`,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
