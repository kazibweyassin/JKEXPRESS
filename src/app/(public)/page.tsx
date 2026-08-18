import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  HardHat,
  Home,
  KeyRound,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/ui/property-card";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { getCompanySettings } from "@/lib/company";
import { safeQuery } from "@/lib/safe-query";
import { projectCoverImage } from "@/lib/site-photos";
import HeroSlider from "@/components/ui/hero-slider";

export default async function HomePage() {
  const company = await getCompanySettings();

  const [featuredProperties, projects, testimonials, news, stats] =
    await Promise.all([
      safeQuery(
        () =>
          db.property.findMany({
            where: { isPublished: true, isFeatured: true, deletedAt: null },
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              _count: { select: { images: true } },
            },
            take: 6,
            orderBy: { listedAt: "desc" },
          }),
        [],
      ),
      safeQuery(
        () =>
          db.constructionProject.findMany({
            where: { isPublished: true, deletedAt: null },
            take: 6,
            orderBy: { updatedAt: "desc" },
          }),
        [],
      ),
      safeQuery(
        () =>
          db.testimonial.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            take: 3,
          }),
        [],
      ),
      safeQuery(
        () =>
          db.newsArticle.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: "desc" },
            take: 3,
          }),
        [],
      ),
      Promise.all([
        safeQuery(
          () => db.property.count({ where: { isPublished: true, deletedAt: null } }),
          0,
        ),
        safeQuery(
          () => db.constructionProject.count({ where: { status: "COMPLETED" } }),
          0,
        ),
        safeQuery(() => db.unit.count({ where: { status: "OCCUPIED" } }), 0),
        safeQuery(() => db.lease.count({ where: { status: "ACTIVE" } }), 0),
      ]),
    ]);

  const [propertyCount, completedProjects, occupiedUnits, activeLeases] = stats;
  const visibleStats = [
    { label: "Properties", value: propertyCount },
    { label: "Completed projects", value: completedProjects },
    { label: "Occupied units", value: occupiedUnits },
    { label: "Active leases", value: activeLeases },
  ].filter((s) => s.value > 0);

  return (
    <div>
      <section className="relative overflow-hidden text-white">
        <HeroSlider background>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" size="lg" asChild>
              <Link href="/properties">
                Browse properties <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="default" size="lg" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
          {visibleStats.length > 0 ? (
            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {visibleStats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">
                    <span className="text-accent-400">{s.value}</span>+
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </HeroSlider>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { title: "Kampala · Entebbe · Jinja", text: "Local teams across Uganda’s growth corridors." },
            { title: "Site-supervised delivery", text: "Milestones, reporting and finish standards." },
            { title: "Sales & leasing", text: "Homes, land and commercial assets." },
            { title: "Owner reporting", text: "Rent, maintenance and occupancy in one view." },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-sm font-semibold text-navy-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-navy-900">Our services</h2>
          <p className="mt-2 text-slate-600">
            End-to-end capability from groundbreaking to long-term asset management.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              href: "/services/construction",
              icon: HardHat,
              title: "Construction",
              text: "Residential, commercial and infrastructure projects with disciplined site controls.",
            },
            {
              href: "/services/real-estate",
              icon: Building2,
              title: "Real estate",
              text: "Sales, acquisitions and advisory for homes, land and commercial assets.",
            },
            {
              href: "/services/property-management",
              icon: KeyRound,
              title: "Property management",
              text: "Tenant relations, rent collection, maintenance and owner reporting.",
            },
          ].map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className="h-full rounded-2xl transition hover:shadow-md hover:ring-1 hover:ring-accent-500/30">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-navy-50 p-3 text-navy-900">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-100/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy-900">
                Featured properties
              </h2>
              <p className="mt-2 text-slate-600">Curated listings across Uganda.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/properties">View all</Link>
            </Button>
          </div>
          {featuredProperties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={{ ...p, imageCount: p._count.images }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Home}
              title="Listings coming soon"
              description="Published properties will appear here. Talk to the team if you are buying, selling or leasing."
              action={
                <Button variant="accent" asChild>
                  <Link href="/contact">Contact us</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-900">Projects</h2>
            <p className="mt-2 text-slate-600">Ongoing and completed construction work.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/projects">All projects</Link>
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="overflow-hidden rounded-2xl transition hover:shadow-md">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-navy-900 line-clamp-1">
                        {project.name}
                      </h3>
                      <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-900">
                        {project.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {project.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {project.city} · {project.completionPercentage}% complete
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HardHat}
            title="Projects will appear here"
            description="Published construction work is shown on this page once it is ready to share."
          />
        )}
      </section>

      <section className="bg-navy-900 text-white">
        <div className="brand-red-bar h-1.5 w-full" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold">
            Why choose {company.companyName}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Trusted operators", text: "Transparent reporting and audited workflows." },
              { icon: Home, title: "Full lifecycle", text: "Build, sell, lease and manage under one roof." },
              { icon: Star, title: "Local expertise", text: "Deep knowledge of Uganda property markets." },
              { icon: Building2, title: "Premium delivery", text: "Quality standards on every site and asset." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <item.icon className="h-6 w-6 text-accent-400" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            Client testimonials
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5 text-accent-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 font-semibold text-navy-900">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
                Insights
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900">
                News & insights
              </h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Market notes, site standards and practical property guidance from
                the JK Express team.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/news" className="text-navy-900">
                All news
              </Link>
            </Button>
          </div>

          {news.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {news.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block text-inherit no-underline"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-accent-500/25">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                      <Image
                        src={article.coverImage || "/site-photos/site-01.jpeg"}
                        alt={article.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={i === 0}
                      />
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-900 shadow-sm">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="text-base font-semibold text-navy-900 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="flex-1 text-sm text-slate-600 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-accent-500">
                        Read article <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Insights coming soon"
              description="Articles will appear here once they are published."
              action={
                <Link href="/news" className="text-sm font-medium text-navy-900 hover:underline">
                  Visit the news page
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl brand-hero-bg px-8 py-12 text-white sm:px-12">
          <div className="brand-red-bar mb-6 h-1 w-24 rounded-full" />
          <h2 className="font-serif text-3xl font-bold">Ready to start your project?</h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Talk to our team about construction, buying, selling or professional property management.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="accent" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/book-viewing">Schedule a viewing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
