"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SITE_PHOTOS } from "@/lib/site-photos";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
};

const slides: Slide[] = HERO_SITE_PHOTOS.map((photo, i) => ({
  id: i + 1,
  title:
    i === 0
      ? "Quality construction across Uganda"
      : i === 1
        ? "Multi-storey projects delivered with control"
        : i === 2
          ? "Active sites. Real progress."
          : i === 3
            ? "From structure to handover"
            : "Teams building on the ground",
  subtitle:
    i === 0
      ? "Residential, commercial and institutional works by JK Express."
      : i === 1
        ? "Scaffolded frames, disciplined site execution and clear reporting."
        : i === 2
          ? "See the work happening on our construction portfolio."
          : i === 3
            ? "Transparent planning and milestone accountability."
            : "Local crews delivering projects with safety and pace.",
  image: photo.src,
}));

type Props = {
  background?: boolean;
};

export default function HeroSlider({ background }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused]);

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  const dots = (
    <div className="flex items-center gap-2">
      {slides.map((_, dot) => (
        <button
          type="button"
          key={dot}
          onClick={() => setIndex(dot)}
          aria-label={`Go to slide ${dot + 1}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-200",
            dot === index ? "w-7 bg-accent-400" : "w-2.5 bg-white/40 hover:bg-white/70",
          )}
        />
      ))}
    </div>
  );

  return background ? (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-4 pb-5 sm:px-6 lg:px-8">
        <div className="max-w-md">
          <p className="text-sm font-medium text-white drop-shadow">
            {slides[index].title}
          </p>
          {slides[index].subtitle ? (
            <p className="mt-0.5 text-xs text-slate-200/90 drop-shadow">
              {slides[index].subtitle}
            </p>
          ) : null}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {dots}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-80 w-full bg-slate-200">
        {slides.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt={s.title}
            fill
            className={cn(
              "absolute inset-0 object-cover transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow">{slides[index].title}</h3>
          {slides[index].subtitle ? (
            <p className="mt-1 text-sm text-slate-200 drop-shadow">
              {slides[index].subtitle}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="rounded-full bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="rounded-full bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
            >
              Next
            </button>
            <div className="ml-auto">{dots}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
