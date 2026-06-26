"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/features/products/types";
import { ProductCardBoutique } from "../ProductCardBoutique";

interface Props {
  products: Product[];
  /** Cards visible at a time on desktop. */
  itemsPerView?: 3 | 4;
  density?: "default" | "editorial";
}

/**
 * Horizontal snap-scroll rail of products. Beautiful on mobile (native swipe),
 * with subtle chevron controls on desktop.
 */
export function ProductRail({ products, itemsPerView = 4, density = "default" }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-rail-card]");
    const step = (card?.offsetWidth ?? 280) + 24;
    el.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  const widthClass =
    itemsPerView === 3
      ? "w-[78%] sm:w-[44%] lg:w-[31%]"
      : "w-[78%] sm:w-[44%] lg:w-[23%]";

  return (
    <div className="relative -mx-4 lg:mx-0">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-surface/95 backdrop-blur border border-line/60 text-ink hover:text-wine shadow-card transition-colors"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-surface/95 backdrop-blur border border-line/60 text-ink hover:text-wine shadow-card transition-colors"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 lg:px-0 pb-2"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            data-rail-card
            className={`flex-none snap-start ${widthClass}`}
          >
            <ProductCardBoutique product={p} density={density} priority={i < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}
