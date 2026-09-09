import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileSearch, HardHat, MessageCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientsStrip } from "@/components/ui/clients-strip";
import { CredentialsStrip } from "@/components/ui/credentials-strip";
import { CONSTRUCTION_SERVICES, getConstructionService } from "@/lib/construction-services";
import { pageMeta } from "@/lib/seo";
import { projectGalleryImages } from "@/lib/site-photos";

export function generateStaticParams() {
  return CONSTRUCTION_SERVICES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const service = getConstructionService((await params).slug);
  if (!service) return {};
  return pageMeta({ title: `${service.title} in Uganda`, description: `${service.summary} Site assessment, planning, execution and documented handover from JK Express.`, path: `/services/construction/${service.slug}` });
}

const deliverySteps = [
  { number: "01", icon: FileSearch, title: "Review and site assessment", text: "We review drawings, scope, access, existing conditions and the result the client needs." },
  { number: "02", icon: ClipboardCheck, title: "Technical and commercial proposal", text: "We define methodology, responsibilities, programme, quantities and commercial terms." },
  { number: "03", icon: HardHat, title: "Controlled execution", text: "The assigned team coordinates labour, materials, safety, quality checks and progress reporting." },
  { number: "04", icon: ShieldCheck, title: "Inspection and handover", text: "Completed work is inspected, defects are closed and the handover record is agreed with the client." },
] as const;

export default async function ConstructionServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getConstructionService((await params).slug);
  if (!service) notFound();
  const gallery = projectGalleryImages(service.slug, 4, service.image);
  const related = CONSTRUCTION_SERVICES.filter((item) => item.slug !== service.slug).slice(0, 3);

  return <div>
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <Image src={service.image} alt={service.title} fill priority className="object-cover opacity-40" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/30" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl"><Badge variant="gold">Construction service {service.number}</Badge><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{service.title}</h1><p className="mt-6 text-lg leading-8 text-slate-200">{service.description}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button variant="gold" size="lg" asChild><Link href={`/request-quote?service=${service.slug}`}>Request a quotation <ArrowRight className="h-4 w-4" /></Link></Button><Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/15" asChild><Link href="/projects">View completed work</Link></Button></div>
        </div>
      </div>
    </section>
    <CredentialsStrip />

    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Service overview</p><h2 className="mt-3 text-3xl font-bold text-navy-900">A complete, accountable package</h2><p className="mt-5 text-base leading-7 text-slate-600">{service.description}</p><p className="mt-4 text-base leading-7 text-slate-600">The exact scope is developed around the site, drawings and performance requirement. JK Express can deliver this as a standalone specialist package or coordinate it within a wider building contract.</p><h3 className="mt-8 text-lg font-semibold text-navy-900">Included capabilities</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{service.deliverables.map((item) => <li key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />{item}</li>)}</ul>
      </div>
      <aside className="rounded-2xl bg-navy-950 p-8 text-white"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Before we quote</p><h2 className="mt-3 text-2xl font-bold">Information that helps us respond accurately</h2><ul className="mt-6 space-y-4 text-sm text-slate-200">{["Site location and access conditions", "Available drawings, specifications or photographs", "Required quantities or approximate dimensions", "Target start date and completion requirement", "Known constraints, approvals or occupied areas"].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />{item}</li>)}</ul><Button variant="gold" className="mt-8 w-full" asChild><Link href={`/request-quote?service=${service.slug}`}>Send your project details</Link></Button></aside>
    </section>

    <section className="border-y border-slate-200 bg-slate-50 py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">How we deliver</p><h2 className="mt-3 text-3xl font-bold text-navy-900">From first review to signed handover</h2><p className="mt-3 text-slate-600">A clear sequence keeps technical decisions, cost and site responsibility visible.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{deliverySteps.map((step) => <Card key={step.number} className="h-full"><CardContent className="p-6"><div className="flex items-center justify-between"><step.icon className="h-6 w-6 text-gold-600" /><span className="text-sm font-bold text-navy-300">{step.number}</span></div><h3 className="mt-5 font-semibold text-navy-900">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></CardContent></Card>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="grid items-end gap-5 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Where it applies</p><h2 className="mt-3 text-3xl font-bold text-navy-900">Typical project applications</h2></div><p className="text-slate-600">Applications vary by design and site conditions. We confirm suitability during the technical review.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{service.applications.map((item, index) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><span className="text-xs font-bold text-gold-600">0{index + 1}</span><p className="mt-3 font-semibold text-navy-900">{item}</p></div>)}</div></section>

    <section className="bg-navy-950 py-16 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Evidence from site</p><h2 className="mt-3 text-3xl font-bold">Work is easier to trust when it is visible</h2><p className="mt-3 text-slate-300">JK Express documents progress, workmanship and site conditions throughout delivery.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gallery.map((src, index) => <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800"><Image src={src} alt={`${service.title} project evidence ${index + 1}`} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width: 640px) 100vw, 25vw" /></div>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="grid gap-10 lg:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Quality and control</p><h2 className="mt-3 text-3xl font-bold text-navy-900">What the client can expect</h2><div className="mt-6 space-y-4">{["A written scope and commercial basis before mobilisation", "Named responsibility for site coordination and reporting", "Material and workmanship checks against the agreed specification", "Variation control before additional work proceeds", "Snag closure and a documented handover"].map((item) => <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />{item}</div>)}</div></div>
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Common questions</p><div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">{[["Can JK Express handle only this specialist package?", "Yes. We can deliver it independently or coordinate it within a larger JK Express construction contract."], ["Do you provide a site visit before quoting?", "Where site conditions affect quantity, access or methodology, we recommend an assessment before issuing the final quotation."], ["Can you work from drawings or a bill of quantities?", "Yes. Send the available drawings, BOQ or specification and we will identify clarifications before pricing."], ["How is additional work controlled?", "Work outside the agreed scope is documented and priced as a variation before execution, except where immediate safety action is required."]].map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none font-semibold text-navy-900">{question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p></details>)}</div></div></div></section>

    <ClientsStrip />
    <section className="border-t border-slate-200 bg-slate-50 py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Related capabilities</p><h2 className="mt-3 text-3xl font-bold text-navy-900">Services often combined with this work</h2></div><Link href="/services/construction" className="text-sm font-semibold text-navy-900 hover:underline">View all construction services</Link></div><div className="mt-8 grid gap-6 md:grid-cols-3">{related.map((item) => <Link key={item.slug} href={`/services/construction/${item.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="relative aspect-[16/8] overflow-hidden"><Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" /></div><div className="p-5"><span className="text-xs font-bold text-gold-600">{item.number}</span><h3 className="mt-2 font-semibold text-navy-900">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.summary}</p></div></Link>)}</div></div></section>

    <section className="bg-navy-900 py-14 text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="text-2xl font-bold">Have drawings, a scope or a site problem?</h2><p className="mt-2 max-w-2xl text-slate-300">Send what you have. Our team will review the requirement and recommend the appropriate construction package.</p></div><div className="flex flex-wrap gap-3"><Button variant="gold" asChild><Link href={`/request-quote?service=${service.slug}`}>Request a quotation</Link></Button><Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/15" asChild><a href="https://wa.me/256704776059"><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button></div></div></section>
  </div>;
}
