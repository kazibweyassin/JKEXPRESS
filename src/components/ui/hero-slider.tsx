"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_SITE_PHOTOS } from "@/lib/site-photos";

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

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return background ? (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-black/10" />
    </div>
  ) : (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
      <div className="relative h-80 w-full bg-slate-200">
        {slides.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt={s.title}
            fill
            className={`absolute inset-0 object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-semibold drop-shadow">{slides[index].title}</h3>
          {slides[index].subtitle ? (
            <p className="mt-1 text-sm text-slate-200 drop-shadow">{slides[index].subtitle}</p>
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
            <div className="ml-auto flex gap-2">
              {slides.map((_, dot) => (
                <button
                  type="button"
                  key={dot}
                  onClick={() => setIndex(dot)}
                  aria-label={`Go to slide ${dot + 1}`}
                  className={`h-2 w-6 rounded-full transition-all duration-200 ${
                    dot === index ? "bg-gold-400" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
