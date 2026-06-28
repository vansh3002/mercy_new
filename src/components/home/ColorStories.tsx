"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SafeImage } from "../SafeImage";
import type { Product } from "@/features/products/types";

interface Story {
  label: string;
  swatch: string;
  product: Product;
  /** Optional poetic caption shown beside the swatch button. */
  caption?: string;
}

interface Props {
  stories: Story[];
}

/**
 * Cinematic colour-story switcher ,picking a colour swatch on the left replaces
 * the editorial portrait on the right. Pure CSS crossfade + interactive state.
 */
export function ColorStories({ stories }: Props) {
  const [active, setActive] = useState(0);
  const current = stories[active];

  return (
    <section className="container-editorial py-14 lg:py-24">
      <div className="grid gap-8 lg:gap-14 lg:grid-cols-[1fr_1.1fr] items-start">
        <div className="flex flex-col">
          <span className="label text-wine/80">Color Stories</span>
          <h2 className="mt-3 serif text-[32px] lg:text-[44px] leading-[1.05] text-ink text-balance">
            Find your shade. The piece will find you.
          </h2>
          <p className="mt-4 text-ink-dim max-w-md">
            Each colour is paired with a piece we love wearing it as. Tap a swatch ,the look
            updates beside it.
          </p>

          <ul className="mt-8 flex flex-col" role="tablist" aria-label="Color stories">
            {stories.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.label}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(i)}
                    className={[
                      "w-full flex items-center gap-4 py-4 border-b border-line/50 text-left transition-colors group",
                      isActive ? "text-ink" : "text-ink-dim hover:text-ink",
                    ].join(" ")}
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-line/80 shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: s.swatch }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block serif text-[22px] lg:text-[26px] leading-tight">
                        {s.label}
                      </span>
                      <span className="block text-xs text-ink-faint mt-0.5 line-clamp-1">
                        {s.caption ?? s.product.subtitle}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.5}
                      className={[
                        "shrink-0 transition-all duration-300",
                        isActive
                          ? "opacity-100 text-wine"
                          : "opacity-0 group-hover:opacity-60",
                      ].join(" ")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <Link
          href={`/product/${current.product.slug}`}
          className="relative block aspect-[4/5] overflow-hidden bg-surface-2 rounded-[2px] shadow-card group"
          aria-label={`Shop ${current.product.title}`}
        >
          {stories.map((s, i) => (
            <SafeImage
              key={s.product.id}
              src={s.product.images.grid}
              alt={s.product.title}
              title={s.product.title}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className={[
                "object-cover absolute inset-0 transition-all duration-[1100ms]",
                i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]",
              ].join(" ")}
              fallbackClassName="absolute inset-0 w-full h-full"
            />
          ))}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-transparent"
          />
          <div className="absolute inset-x-5 bottom-5 text-on-accent flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="label-sm opacity-90">In this story</p>
              <p className="serif text-2xl lg:text-3xl leading-tight mt-1 line-clamp-2">
                {current.product.title}
              </p>
            </div>
            <span className="w-11 h-11 rounded-full bg-on-accent/15 backdrop-blur-sm border border-on-accent/30 flex items-center justify-center group-hover:bg-on-accent group-hover:text-wine transition-all">
              <ArrowUpRight size={18} strokeWidth={1.75} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
