"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/properties", label: "Properties" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({ companyName = "JK Express" }: { companyName?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="brand-red-bar h-1 w-full" />
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center" aria-label={companyName}>
          <Logo height={56} priority variant="full" />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-2 text-sm font-medium transition",
                isActive(pathname, item.href)
                  ? "bg-navy-50 text-navy-900"
                  : "text-slate-600 hover:bg-navy-50 hover:text-navy-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/book-viewing"
            className="text-sm font-medium text-slate-600 transition hover:text-navy-900"
          >
            Book viewing
          </Link>
          <Button variant="accent" size="sm" asChild>
            <Link href="/request-quote">Request quote</Link>
          </Button>
          <Link
            href="/login"
            className="text-sm text-slate-500 transition hover:text-navy-900"
          >
            Sign in
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-navy-900 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-slate-100 bg-white lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2.5 text-sm font-medium",
                isActive(pathname, item.href)
                  ? "bg-navy-50 text-navy-900"
                  : "text-slate-700 hover:bg-navy-50 hover:text-navy-900",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/book-viewing"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-navy-50"
            >
              Book viewing
            </Link>
            <Button variant="accent" asChild>
              <Link href="/request-quote" onClick={() => setOpen(false)}>
                Request quote
              </Link>
            </Button>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-center text-sm text-slate-500"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
