import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectSlider } from "@/components/ui/project-slider";
import { db } from "@/lib/db";
import { projectCoverImage } from "@/lib/site-photos";
import { statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await db.constructionProject.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 12,
  });

  const slides = projects.slice(0, 6).map((project) => ({
    id: project.id,
    slug: project.slug,
    name: project.name,
    description: project.description,
    city: project.city,
    location: project.location,
    status: project.status,
    statusLabel: statusLabel(project.status),
    completionPercentage: project.completionPercentage,
    image: projectCoverImage(project.id, project.featuredImage),
  }));

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Portfolio
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Construction projects across Uganda
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Active sites and completed works in Kampala, Entebbe, Jinja and
            surrounding growth corridors — delivered with clear milestones and
            site reporting.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {slides.length > 0 ? (
          <ProjectSlider projects={slides} intervalMs={4500} />
        ) : null}

        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">All projects</h2>
              <p className="mt-1 text-sm text-slate-600">
                Browse the full published portfolio.
              </p>
            </div>
            <p className="text-sm text-slate-500">{projects.length} projects</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="h-full overflow-hidden transition hover:shadow-md hover:ring-1 hover:ring-gold-500/20">
                  <div className="relative aspect-[16/10] bg-slate-200">
                    <Image
                      src={projectCoverImage(project.id, project.featuredImage)}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(project.status)}>
                        {statusLabel(project.status)}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {project.completionPercentage}%
                      </span>
                    </div>
                    <h2 className="font-semibold text-navy-900 line-clamp-1">
                      {project.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[project.location, project.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {projects.length === 0 ? (
            <p className="mt-12 text-center text-slate-500">
              No published projects yet.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
