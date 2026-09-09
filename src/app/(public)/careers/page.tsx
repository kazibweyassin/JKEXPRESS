import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { statusLabel } from "@/lib/utils";

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Careers at JK Express",
  description:
    "Join JK Express in construction, real estate and property management roles across Uganda.",
  path: "/careers",
});

export default async function CareersPage() {
  const company = await getCompanySettings();
  const jobs = await safeQuery(
    () =>
      db.jobPosting.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  return (
    <div>
      <PageHero
        eyebrow="Join the team"
        title="Careers"
        description={`Join ${company.companyName}. Build careers in construction, real estate and property management.`}
      />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
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
