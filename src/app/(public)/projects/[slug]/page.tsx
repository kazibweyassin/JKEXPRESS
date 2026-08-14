import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HardHat,
  MapPin,
  Shield,
  TrendingUp,
} from "lucide-react";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGallerySlider } from "@/components/ui/image-gallery-slider";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";
import { getLocationStory } from "@/lib/location-stories";
import { projectGalleryImages } from "@/lib/site-photos";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";
import { whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await db.constructionProject.findUnique({ where: { slug } });
  return {
    title: project?.name ?? "Project",
    description: project?.description ?? undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanySettings();
  const project = await db.constructionProject.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      milestones: { orderBy: { dueDate: "asc" } },
      phases: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();

  const gallery = projectGalleryImages(project.id, 8, project.featuredImage);
  const locationStory = getLocationStory(project.city, project.location);
  const placeLabel =
    [project.location, project.city].filter(Boolean).join(" · ") || "Uganda";

  const waLink = whatsappLink(
    company.whatsapp ?? company.phone,
    `Hello ${company.companyName}, I'm interested in the project: ${project.name} (${project.code}).`,
  );

  const whyPoints = [
    {
      icon: HardHat,
      title: "Disciplined delivery",
      text: "Site controls, milestone tracking and clear client reporting on every phase.",
    },
    {
      icon: Shield,
      title: "Trusted operator",
      text: "One team from structure through finishes, handover and ongoing support.",
    },
    {
      icon: TrendingUp,
      title: "Asset-minded building",
      text: "Quality standards that protect long-term value for owners and investors.",
    },
    {
      icon: Building2,
      title: "Local market strength",
      text: "Deep knowledge of Kampala, Entebbe, Jinja and East African growth corridors.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/projects"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            ← All projects
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(project.status)}>
              {statusLabel(project.status)}
            </Badge>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {project.code}
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {project.name}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-slate-300">
            <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
            {placeLabel}
          </p>
          {project.description ? (
            <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              {project.description}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="gold" asChild>
              <Link href="#inquire">Book a site visit</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/request-quote">Request a quotation</Link>
            </Button>
            {waLink ? (
              <Button
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href={waLink} target="_blank" rel="noreferrer">
                  WhatsApp us
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ImageGallerySlider images={gallery} alt={project.name} />

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Stats */}
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Progress
                </dt>
                <dd className="mt-1 text-3xl font-bold text-navy-900">
                  {project.completionPercentage}%
                </dd>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gold-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, project.completionPercentage))}%`,
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Contract value
                </dt>
                <dd className="mt-1 text-2xl font-bold text-navy-900">
                  {project.contractValue
                    ? formatCurrency(Number(project.contractValue))
                    : "—"}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Start
                </dt>
                <dd className="mt-1 text-lg font-semibold text-navy-900">
                  {formatDate(project.startDate)}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Expected completion
                </dt>
                <dd className="mt-1 text-lg font-semibold text-navy-900">
                  {formatDate(project.expectedCompletion)}
                </dd>
              </div>
            </dl>

            {/* Location story */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
                Location
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900">
                {locationStory.title}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {locationStory.text}
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {locationStory.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-navy-900"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Site visit hours — Cadenza-style */}
            <section className="overflow-hidden rounded-2xl bg-navy-900 text-white">
              <div className="brand-red-bar h-1 w-full" />
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                    Site visits
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">Open for tours</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Our project team hosts site visits so you can review progress,
                    finishes and next milestones on the ground.
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3 rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-gold-400" />
                    Monday – Saturday
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock3 className="h-4 w-4 text-gold-400" />
                    8:00 AM – 5:00 PM
                  </div>
                  <Link
                    href="#inquire"
                    className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] px-4 text-sm font-semibold text-white"
                  >
                    Book a site visit
                  </Link>
                </div>
              </div>
            </section>

            {/* Why this project */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
                Why build with us
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy-900">
                Why {project.name}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {whyPoints.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <item.icon className="h-5 w-5 text-gold-500" />
                    <h3 className="mt-3 font-semibold text-navy-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery grid */}
            <section>
              <h2 className="text-2xl font-bold text-navy-900">Site gallery</h2>
              <p className="mt-1 text-sm text-slate-500">
                Progress photography from our construction portfolio.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200"
                  >
                    <Image
                      src={src}
                      alt={`${project.name} site photo`}
                      fill
                      className="object-cover transition duration-300 hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, 300px"
                    />
                  </div>
                ))}
              </div>
            </section>

            {project.phases.length > 0 ? (
              <section>
                <h2 className="text-2xl font-bold text-navy-900">Phases</h2>
                <ul className="mt-4 space-y-2">
                  {project.phases.map((phase) => (
                    <li
                      key={phase.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-navy-900">
                        {phase.name}
                      </span>
                      <Badge variant={statusVariant(phase.status)}>
                        {statusLabel(phase.status)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {/* Sticky-ish inquiry column */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-24">
              <Card id="inquire" className="scroll-mt-28">
                <CardHeader>
                  <CardTitle className="text-base">
                    Inquire about this project
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Book a site visit or speak to our construction team.
                  </p>
                </CardHeader>
                <CardContent>
                  <PublicLeadForm
                    interest="CONSTRUCTION"
                    showInterest={false}
                    source="PROJECT_PAGE"
                    submitLabel="Send inquiry"
                    compact
                    defaultMessage={`I'm interested in ${project.name} (${project.code}) at ${placeLabel}.`}
                    messageLabel="Message"
                    messagePlaceholder="Preferred visit date, questions about scope, or partnership interest."
                  />
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Chat on WhatsApp
                    </a>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="bg-slate-50">
                <CardContent className="space-y-2 p-5 text-sm text-slate-600">
                  <p className="font-semibold text-navy-900">Client</p>
                  <p>{project.clientName ?? "Confidential client"}</p>
                  <p className="pt-2 font-semibold text-navy-900">Status</p>
                  <p>{statusLabel(project.status)}</p>
                  {project.city ? (
                    <>
                      <p className="pt-2 font-semibold text-navy-900">City</p>
                      <p>{project.city}</p>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Bottom CTA band */}
        <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-10 text-white sm:px-10">
          <div className="brand-red-bar mb-5 h-1 w-20 rounded-full" />
          <h2 className="text-2xl font-bold sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-2 max-w-xl text-slate-300">
            Talk to JK Express about construction delivery, investment units or
            long-term property management for this corridor.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#inquire"
              className="inline-flex h-10 items-center rounded-md bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] px-5 text-sm font-semibold text-white"
            >
              Inquire now
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center rounded-md border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Contact the team
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
