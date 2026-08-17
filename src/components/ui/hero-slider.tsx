"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SITE_PHOTOS } from "@/lib/site-photos";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: "Construction · Real estate · Property management",
    title: "Built spaces. Trusted assets. One team.",
    subtitle:
      "JK Express delivers construction, brokerage and full-service property management across Uganda.",
    image: HERO_SITE_PHOTOS[0]?.src ?? "/site-photos/site-01.jpeg",
  },
  {
    id: 2,
    eyebrow: "Construction delivery",
    title: "Multi-storey projects delivered with control.",
    subtitle:
      "Scaffolded frames, disciplined site execution and reporting you can share with stakeholders.",
    image: HERO_SITE_PHOTOS[1]?.src ?? "/site-photos/site-05.jpeg",
  },
  {
    id: 3,
    eyebrow: "On the ground",
    title: "Active sites. Real progress.",
    subtitle:
      "See the work happening across our construction portfolio in Kampala and beyond.",
    image: HERO_SITE_PHOTOS[2]?.src ?? "/site-photos/site-08.jpeg",
  },
  {
    id: 4,
    eyebrow: "From structure to handover",
    title: "Clear milestones. Accountable delivery.",
    subtitle:
      "Transparent planning, finish standards and handover that protect long-term asset value.",
    image: HERO_SITE_PHOTOS[3]?.src ?? "/site-photos/site-03.jpeg",
  },
  {
    id: 5,
    eyebrow: "Local crews",
    title: "Teams building on the ground.",
    subtitle:
      "Ugandan site teams delivering residential, commercial and institutional works with pace and care.",
    image: HERO_SITE_PHOTOS[4]?.src ?? "/site-photos/site-14.jpeg",
  },
];

const INTERVAL_MS = 5500;

type Props = {
  background?: boolean;
  children?: React.ReactNode;
};

export default function HeroSlider({ background, children }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);
  const active = slides[index];

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

  if (background) {
    return (
      <div className="relative min-h-[540px] overflow-hidden text-white lg:min-h-[620px]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center px-4 pb-24 pt-20 sm:px-6 lg:min-h-[620px] lg:px-8 lg:pb-28 lg:pt-24">
          <div key={active.id} className="hero-copy-in max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
              {active.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {active.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200 sm:text-xl">
              {active.subtitle}
            </p>
          </div>
          {children}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-end gap-2 px-4 pb-5 sm:px-6 lg:px-8">
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
    );
  }

  return (
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
          <h3 className="text-lg font-semibold drop-shadow">{active.title}</h3>
          <p className="mt-1 text-sm text-slate-200 drop-shadow">{active.subtitle}</p>
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
