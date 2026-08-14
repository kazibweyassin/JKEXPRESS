import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";
import { statusLabel } from "@/lib/utils";

export const metadata = { title: "Careers" };

export default async function CareersPage() {
  const company = await getCompanySettings();
  const jobs = await db.jobPosting.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-navy-900">Careers</h1>
      <p className="mt-2 text-slate-600">
        Join {company.companyName}. Build careers in construction, real estate and property management.
      </p>
      <div className="mt-10 space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-navy-900">{job.title}</h2>
                <Badge variant="secondary">{statusLabel(job.type)}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {[job.department, job.location].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {job.description}
              </p>
              <p className="mt-4 text-sm text-navy-800">
                Apply by emailing{" "}
                <a className="underline" href={`mailto:${company.email ?? "careers@jkexpress.ug"}`}>
                  {company.email ?? "careers@jkexpress.ug"}
                </a>
              </p>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 ? (
          <p className="text-slate-500">No open positions at the moment. Check back soon.</p>
        ) : null}
      </div>
    </div>
  );
}
