"use client";

import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";

export function StickyCtaBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="border-t border-slate-200/90 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-6 lg:px-8">
          <p className="mr-auto hidden text-sm text-slate-600 md:block">
            Ready to build, buy or manage property?
          </p>
          <Link
            href="/book-viewing"
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-900 transition hover:bg-navy-50 sm:flex-none sm:px-4 sm:text-sm"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            Book viewing
          </Link>
          <Link
            href="/request-quote"
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] px-3 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 sm:flex-none sm:px-4 sm:text-sm"
          >
            <FileText className="h-4 w-4 shrink-0" />
            Request quote
          </Link>
        </div>
      </div>
    </div>
  );
}
