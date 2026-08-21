import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  HardHat,
  Ruler,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SitePhotoGallery } from "@/components/ui/site-photo-gallery";
import { listPublishedProjects } from "@/lib/public-listings";
import { GALLERY_SITE_PHOTOS, projectCoverImage } from "@/lib/site-photos";
import { statusLabel } from "@/lib/utils";
import { statusVariant } from "@/lib/status";

export const metadata = {
  title: "Construction Services | JK Express",
  description:
    "Residential, commercial and institutional construction with disciplined project controls.",
};

export default async function ConstructionServicePage() {
  const projects = (await listPublishedProjects()).slice(0, 4);

  const capabilities = [
    {
      icon: Ruler,
      title: "Design coordination",
      text: "Align architects, engineers and client requirements before mobilisation.",
    },
    {
      icon: ClipboardCheck,
      title: "Cost & BOQ control",
      text: "Structured bills of quantities, change control and expenditure tracking.",
    },
    {
      icon: HardHat,
      title: "Site execution",
      text: "Daily site discipline, safety awareness and progress documentation.",
    },
    {
      icon: Shield,
      title: "Quality handover",
      text: "Snag lists, commissioning support and clean client handover packages.",
    },
  ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge variant="gold" className="mb-4">
            Construction
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Projects delivered with clarity and control
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            JK Express builds residential, commercial and institutional assets
            with transparent planning, site reporting and milestone accountability.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/contact">
                Talk to our team <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="default"
              className="border-white/30 bg-white text-navy-900 hover:bg-slate-100"
              asChild
            >
              <Link href="/projects">View projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="What we build"
          description="From private residences to multi-unit commercial works — scoped, scheduled and supervised."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Residential homes & apartments",
            "Commercial & office fit-outs",
            "Retail and mixed-use shells",
            "Institutional renovations",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              <p className="text-sm font-medium text-navy-900">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="On our sites"
            description="Real photography from active JK Express construction works across Uganda."
          />
          <SitePhotoGallery photos={GALLERY_SITE_PHOTOS} />
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Delivery capabilities"
            description="Operational systems that keep owners informed and sites productive."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c) => (
              <Card key={c.title}>
                <CardContent className="p-6">
                  <c.icon className="h-6 w-6 text-navy-900" />
                  <h3 className="mt-3 font-semibold text-navy-900">{c.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <PageHeader
            title="Featured construction work"
            description="A selection of published projects from our portfolio."
            actions={
              <Button variant="outline" asChild>
                <Link href="/projects">All projects</Link>
              </Button>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="overflow-hidden transition hover:shadow-md">
                  <div className="relative aspect-[16/10] bg-slate-200">
                    <Image
                      src={projectCoverImage(project.id, project.featuredImage)}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-lg bg-gold-100 p-3 text-gold-900">
                      <HardHat className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-navy-900">
                          {project.name}
                        </h3>
                        <Badge variant={statusVariant(project.status)}>
                          {statusLabel(project.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {project.city ?? "Uganda"} ·{" "}
                        {project.completionPercentage}% complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-12 text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to scope your next build?
          </h2>
          <p className="mt-3 max-w-xl text-slate-300">
            Share drawings, a brief or a rough budget — we will respond with next
            steps and a quotation pathway.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link href="/contact">Talk to our team</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contact">Contact construction team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
