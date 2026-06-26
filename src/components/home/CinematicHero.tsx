"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SafeImage } from "../SafeImage";
import { WomaniyaWordmark } from "../brand/WomaniyaWordmark";
import { OrnateDivider } from "../brand/OrnateDivider";
import { Sparkle } from "../brand/Sparkle";

interface Slide {
  src: string;
  title: string;
  caption?: string;
  href?: string;
}

interface Props {
  slides: Slide[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Big editorial title displayed below the wordmark. */
  headline: string;
  subhead?: string;
  eyebrow?: string;
}

/**
 * Full-bleed cinematic hero with crossfading lookbook slides, a dominant WOMANIYA wordmark,
 * dual CTA and editorial caption. Replaces the "single image + card" template look entirely.
 */
export function CinematicHero({
  slides,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  headline,
  subhead,
  eyebrow = "FW26 Lookbook · Festive in Bloom",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative isolate overflow-hidden bg-bg" aria-label="Womaniya — featured lookbook">
      <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[21/10] w-full">
        {slides.map((s, i) => {
          const inner = (
            <div className="absolute inset-0 scale-[1.2] translate-y-[8%]">
              <SafeImage
                src={s.src}
                alt={s.title}
                title={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className={[
                  "object-cover object-top",
                  i === index ? "animate-image-reveal" : "",
                ].join(" ")}
                fallbackClassName="absolute inset-0 w-full h-full"
              />
            </div>
          );

          return (
            <div
              key={s.src + i}
              className={[
                "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
                i === index ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={i === index ? "false" : "true"}
            >
              {s.href ? (
                <Link href={s.href} aria-label={s.title} className="absolute inset-0 block">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          );
        })}

        {/* Cinematic warm wash + center darkening for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-ink/20 via-ink/35 to-ink/65"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-wine-deep/25 via-transparent to-transparent mix-blend-multiply"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.35)_0%,_transparent_55%)]"
        />

        {/* Corner sparkles */}
        <Sparkle
          className="absolute top-6 right-6 lg:top-10 lg:right-12 w-5 h-5 text-gold/80 pointer-events-none"
          animated
        />
        <Sparkle
          className="absolute bottom-24 lg:bottom-32 left-8 w-4 h-4 text-gold/60 pointer-events-none"
          animated
        />

        {/* Slide dots */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-2 ml-auto" role="tablist" aria-label="Lookbook slides">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={[
                  "h-[3px] rounded-full transition-all duration-500",
                  i === index ? "w-9 bg-on-accent" : "w-4 bg-on-accent/45 hover:bg-on-accent/70",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
