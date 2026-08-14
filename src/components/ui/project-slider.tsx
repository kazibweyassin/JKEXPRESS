"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProjectSlide = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string | null;
  location: string | null;
  status: string;
  statusLabel: string;
  completionPercentage: number;
  image: string;
};

type Props = {
  projects: ProjectSlide[];
  /** Auto-advance interval in ms */
  intervalMs?: number;
  className?: string;
};

export function ProjectSlider({
  projects,
  intervalMs = 4500,
  className,
}: Props) {
  const slides = useMemo(() => projects.slice(0, 6), [projects]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [slides.length, intervalMs, paused]);

  if (slides.length === 0) return null;

  const active = slides[index];
  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-navy-950 text-white", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-[480px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.image}
              alt={slide.name}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-black/20" />
          </div>
        ))}

        <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10 lg:min-h-[480px] lg:p-12">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="gold">{active.statusLabel}</Badge>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                {active.completionPercentage}% complete
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {active.name}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300">
              <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
              {[active.location, active.city].filter(Boolean).join(" · ") ||
                "Uganda"}
            </p>
            {active.description ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200 line-clamp-3 sm:text-base">
                {active.description}
              </p>
            ) : null}
            <Link
              href={`/projects/${active.slug}`}
              className="mt-6 inline-flex h-10 items-center rounded-md bg-[linear-gradient(135deg,_#e80000_0%,_#ff4d4d_100%)] px-5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
            >
              View project
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous project"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next project"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="ml-auto flex flex-wrap gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${slide.name}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-8 bg-gold-400"
                      : "w-3 bg-white/35 hover:bg-white/55",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="relative z-10 border-t border-white/10 bg-black/25 px-3 py-3 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:h-20 sm:w-28",
                i === index
                  ? "ring-gold-400"
                  : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[10px] font-medium text-white line-clamp-1">
                {slide.city ?? slide.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
