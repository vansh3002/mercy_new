"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { OrnateDivider } from "../brand/OrnateDivider";

interface T {
  quote: string;
  name: string;
  location: string;
  product?: string;
}

const TESTIMONIALS: T[] = [
  {
    quote:
      "The chikan work is unreal. I've worn the ivory set to three weddings already and people keep stopping me. It feels heirloom.",
    name: "Aanya Sharma",
    location: "Jaipur",
    product: "Ivory Palace Chikan Set",
  },
  {
    quote:
      "Soft fabric, perfect fit, dispatched the same day. This is now my Sunday-morning brand.",
    name: "Megha Iyer",
    location: "Bengaluru",
    product: "Rose Pink Chikan Tunic",
  },
  {
    quote:
      "I have never seen a store experience like this. Everything from the website to the packaging feels intentional.",
    name: "Nidhi Kapoor",
    location: "Delhi",
    product: "Noir Aari Festive Set",
  },
  {
    quote:
      "The royal blue is my favourite kurta in the wardrobe. Will be buying every colour they release.",
    name: "Sara Khan",
    location: "Mumbai",
    product: "Royal Blue Chikan Kurta",
  },
] as const;

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 5800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="container-editorial py-16 lg:py-24">
      <div className="flex flex-col items-center text-center">
        <span className="label text-wine/80">Loved By Women Who Choose Elegance</span>
        <h2 className="mt-2 serif text-[26px] sm:text-[30px] lg:text-[36px] leading-[1.15] text-ink text-balance max-w-2xl">
          Real stories from women who chose WOMANIYA
        </h2>
        <OrnateDivider width="md" className="mt-5" />
      </div>

      <div
        className="relative mt-10 max-w-3xl mx-auto"
        aria-roledescription="carousel"
        aria-label="Customer testimonials"
      >
        <Quote
          size={56}
          className="absolute -top-4 left-0 text-gold/30"
          strokeWidth={1}
          aria-hidden="true"
        />
        <div className="min-h-[140px] lg:min-h-[160px]">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={i}
              aria-hidden={i !== index}
              className={[
                "absolute inset-0 flex flex-col items-center text-center transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
            >
              <p className="serif text-xl lg:text-2xl text-ink leading-relaxed text-balance px-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-5 text-sm text-ink-dim">
                <span className="font-semibold text-ink">{t.name}</span> · {t.location}
                {t.product && (
                  <span className="block text-xs text-ink-faint mt-1 label-sm">
                    Wearing {t.product}
                  </span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2" role="tablist">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-[3px] rounded-full transition-all duration-500",
                i === index ? "w-9 bg-wine" : "w-4 bg-line hover:bg-line-strong",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
