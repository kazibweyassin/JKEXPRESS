import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Services",
    links: [
      { href: "/services/construction", label: "Construction" },
      { href: "/services/real-estate", label: "Real estate" },
      { href: "/services/property-management", label: "Property management" },
      { href: "/properties", label: "Browse properties" },
      { href: "/projects", label: "Our projects" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/news", label: "News" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/book-viewing", label: "Book a viewing" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/request-quote", label: "Request a quote" },
      { href: "/login", label: "Client sign in" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
] as const;

function parsePhones(phone: string): { label: string; href: string }[] {
  return phone
    .split(/[|,;/]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((label) => {
      const digits = label.replace(/[^\d+]/g, "");
      const href =
        digits.startsWith("+") || digits.startsWith("00")
          ? `tel:${digits}`
          : digits.startsWith("0")
            ? `tel:+256${digits.slice(1)}`
            : `tel:${digits}`;
      return { label, href };
    });
}

export function PublicFooter({
  companyName = "JK Express",
  email = "info@jkexpress.ug",
  phone = "0704 776 059 | 0786 953 313",
  address = "Kampala, Uganda",
}: {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const phones = parsePhones(phone);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600">
      {/* Top CTA strip */}
      <div className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
              Start a conversation
            </p>
            <p className="mt-1 text-lg font-semibold sm:text-xl">
              Building, buying or managing property in Uganda?
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/request-quote"
              className="inline-flex h-10 items-center rounded-md bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] px-5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Request a quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center rounded-md border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>

      <div className="brand-red-bar h-1 w-full" />

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={companyName} className="inline-block">
              <Logo height={42} className="max-h-10" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              JK Express Realtors & Developers Ltd. delivers construction,
              real estate brokerage and professional property management across
              Uganda.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-900" />
                <span>{address}</span>
              </li>
              {phones.map((p) => (
                <li key={p.href} className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-navy-900" />
                  <a
                    href={p.href}
                    className="font-medium text-navy-900 transition hover:text-gold-500"
                  >
                    {p.label}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-navy-900" />
                <a
                  href={`mailto:${email}`}
                  className="font-medium text-navy-900 transition hover:text-gold-500"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:pl-8">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="text-sm font-semibold text-navy-900">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 transition hover:text-navy-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-slate-500 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>
            © {year} {companyName}. All rights reserved.
          </p>
          <p>Kampala · Entebbe · Jinja · East Africa</p>
        </div>
      </div>
    </footer>
  );
}
