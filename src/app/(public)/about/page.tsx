import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  HardHat,
  KeyRound,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientsStrip } from "@/components/ui/clients-strip";
import { CredentialsStrip } from "@/components/ui/credentials-strip";
import { ProfileCta } from "@/components/ui/profile-cta";
import { getCompanySettings } from "@/lib/company";
import { getPublicStats } from "@/lib/public-listings";
import { pageMeta } from "@/lib/seo";
import { SITE_PHOTOS } from "@/lib/site-photos";

export const metadata = pageMeta({
  title: "About JK Express",
  description:
    "Meet JK Express Realtors & Developers Ltd., an integrated Ugandan construction, real estate and property management company.",
  path: "/about",
});

const capabilities = [
  {
    icon: HardHat,
    title: "Construction delivery",
    text: "Planning, coordination and execution for residential, commercial and institutional building works.",
    href: "/services/construction",
  },
  {
    icon: Building2,
    title: "Real estate advisory",
    text: "Property marketing, buyer and tenant support, viewings, negotiation and transaction coordination.",
    href: "/properties",
  },
  {
    icon: KeyRound,
    title: "Property management",
    text: "Tenant relations, collections, maintenance coordination and practical reporting for property owners.",
    href: "/services/property-management",
  },
] as const;

const values = [
  { icon: ShieldCheck, title: "Integrity", text: "We communicate scope, cost, responsibility and progress clearly." },
  { icon: Award, title: "Quality", text: "We protect long-term asset value through disciplined workmanship and checks." },
  { icon: Users, title: "Partnership", text: "We treat every engagement as a shared commercial and operational objective." },
  { icon: MapPin, title: "Local knowledge", text: "Our advice is grounded in Ugandan sites, markets and operating conditions." },
] as const;

const deliveryModel = [
  { number: "01", title: "Understand the objective", text: "We establish the property, project or investment outcome before recommending a scope." },
  { number: "02", title: "Define the right approach", text: "Our team reviews the available information, risks, priorities, programme and budget." },
  { number: "03", title: "Coordinate delivery", text: "We assign responsibility, manage communication and keep the work moving against agreed milestones." },
  { number: "04", title: "Report and close", text: "Progress, decisions and completion are documented so the client has a clear record." },
] as const;

export default async function AboutPage() {
  const company = await getCompanySettings();
  const { propertyCount, completedProjects, activeLeases } = await getPublicStats();
  const stats = [
    { label: "Properties presented", value: propertyCount },
    { label: "Projects completed", value: completedProjects },
    { label: "Leases under management", value: activeLeases },
  ];

  return (
    <div>
      <section className="relative isolate min-h-[620px] overflow-hidden bg-navy-950 text-white">
        <Image src={SITE_PHOTOS[0].src} alt={SITE_PHOTOS[0].alt} fill priority className="object-cover opacity-45" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/25" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="gold">About {company.companyName}</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One accountable partner across the property lifecycle
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              {company.description ?? `${company.companyName} brings construction delivery, real estate support and property operations together for clients who want practical advice and dependable execution in Uganda.`}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="gold" size="lg" asChild><Link href="/contact">Start a conversation <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/15" asChild><Link href="/projects">View our work</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <CredentialsStrip />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">Who we are</p>
          <h2 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">Built around the real needs of owners, developers and occupiers</h2>
          <p className="mt-6 leading-7 text-slate-600">Property decisions rarely sit in isolation. A construction choice affects operations; a purchase affects future maintenance; and property performance depends on consistent day-to-day management. JK Express connects those decisions through one multidisciplinary team.</p>
          <p className="mt-4 leading-7 text-slate-600">We support a client from early assessment and commercial planning through site delivery, transaction coordination and ongoing asset care. The result is clearer responsibility, fewer handover gaps and advice informed by the full life of the property.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Uganda-focused market and site knowledge", "Integrated technical and commercial thinking", "Clear scope, reporting and accountability", "Solutions shaped around the client’s objective"].map((item) => (
              <div key={item} className="flex gap-3 text-sm font-medium text-navy-900"><CheckCircle2 className="h-5 w-5 shrink-0 text-accent-500" />{item}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative mt-10 aspect-[4/5] overflow-hidden rounded-2xl"><Image src={SITE_PHOTOS[13].src} alt={SITE_PHOTOS[13].alt} fill className="object-cover" sizes="25vw" /></div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={SITE_PHOTOS[7].src} alt={SITE_PHOTOS[7].alt} fill className="object-cover" sizes="25vw" /></div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">What we do</p><h2 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">Three disciplines, one connected view</h2><p className="mt-4 text-slate-600">Engage one capability independently or combine them as the asset moves from idea to operation.</p></div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {capabilities.map((item) => <Card key={item.title} className="group h-full"><CardContent className="flex h-full flex-col p-7"><div className="inline-flex w-fit rounded-xl bg-navy-50 p-3 text-navy-900"><item.icon className="h-7 w-7" /></div><h3 className="mt-6 text-xl font-semibold text-navy-900">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.text}</p><Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900">Explore this capability <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">Our direction</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Practical delivery with a long-term asset mindset</h2><p className="mt-5 leading-7 text-slate-300">We measure good work by more than completion. It should be commercially sensible, usable, maintainable and valuable to the people who own or occupy it.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6"><Target className="h-7 w-7 text-gold-400" /><h3 className="mt-5 text-xl font-semibold">Our mission</h3><p className="mt-3 text-sm leading-6 text-slate-300">To help clients build, transact and manage property with confidence through coordinated expertise and accountable service.</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6"><Eye className="h-7 w-7 text-gold-400" /><h3 className="mt-5 text-xl font-semibold">Our vision</h3><p className="mt-3 text-sm leading-6 text-slate-300">To be a trusted Ugandan property partner recognised for quality execution, sound advice and enduring client relationships.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">How we work</p><h2 className="mt-3 text-3xl font-bold text-navy-900">A clear path from brief to result</h2><p className="mt-4 leading-7 text-slate-600">Every engagement is different, but our operating principles stay consistent: establish the objective, define responsibility, communicate decisions and document delivery.</p><div className="mt-7 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><ClipboardCheck className="h-6 w-6 shrink-0 text-accent-500" />Clients receive a defined scope and commercial basis before work begins.</div></div>
          <div className="grid gap-4 sm:grid-cols-2">{deliveryModel.map((step) => <div key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="text-sm font-bold text-accent-500">{step.number}</span><h3 className="mt-4 font-semibold text-navy-900">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></div>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center"><p className="text-4xl font-bold text-navy-900">{stat.value}+</p><p className="mt-2 text-sm text-slate-500">{stat.label}</p></div>)}</div>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy-900 p-6 text-white sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold">Need a procurement-ready introduction?</h2><p className="mt-1 text-sm text-slate-300">Download the JK Express company profile for a concise capability overview.</p></div><ProfileCta /></div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">What guides us</p><h2 className="mt-3 text-3xl font-bold text-navy-900">Values visible in the work</h2></div><div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{values.map((value) => <div key={value.title} className="border-t-2 border-accent-500 pt-5"><value.icon className="h-6 w-6 text-navy-900" /><h3 className="mt-4 font-semibold text-navy-900">{value.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{value.text}</p></div>)}</div></div>
      </section>

      <ClientsStrip />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative aspect-[16/11] overflow-hidden rounded-2xl"><Image src={SITE_PHOTOS[4].src} alt={SITE_PHOTOS[4].alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">Our footprint</p><h2 className="mt-3 text-3xl font-bold text-navy-900">Based in Kampala, working where clients need us</h2><p className="mt-5 leading-7 text-slate-600">From {company.city ?? "Kampala"}, our team coordinates property assignments and construction work across Uganda’s urban centres and growth corridors. Project reach is confirmed against scope, programme and site requirements.</p><div className="mt-6 rounded-xl border border-slate-200 p-5"><div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" /><div><p className="font-semibold text-navy-900">Head office</p><p className="mt-1 text-sm text-slate-600">{[company.address, company.city, company.country].filter(Boolean).join(", ")}</p></div></div></div><div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/contact">Contact our team</Link></Button><Button variant="outline" asChild><a href={`https://wa.me/${(company.whatsapp ?? "+256704776059").replace(/\D/g, "")}`}><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button></div></div>
      </section>

      <section className="bg-navy-900 py-14 text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="text-2xl font-bold">Tell us what you are planning</h2><p className="mt-2 max-w-2xl text-slate-300">Share your site, property or management requirement and we’ll direct it to the right JK Express team.</p></div><Button variant="gold" size="lg" asChild><Link href="/contact">Discuss your requirement <ArrowRight className="h-4 w-4" /></Link></Button></div></section>
    </div>
  );
}
