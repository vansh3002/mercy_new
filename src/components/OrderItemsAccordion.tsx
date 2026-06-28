"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SafeImage } from "./SafeImage";
import { rupees } from "@/lib/format";

interface OrderLine {
  title: string;
  size: string;
  qty: number;
  price: number;
  image?: string;
}

interface Props {
  lines: OrderLine[];
  etaLabel: string;
}

export function OrderItemsAccordion({ lines, etaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const hero = lines[0];
  const rest = lines.slice(1);

  if (!hero) return null;

  return (
    <article className="bg-surface border border-line/60 rounded-[2px] shadow-card overflow-hidden">
      {/* Hero row */}
      <div className="flex gap-4 p-4 lg:p-5">
        {hero.image && (
          <div className="relative w-[100px] h-[120px] flex-shrink-0 bg-surface-2 overflow-hidden rounded-[2px]">
            <SafeImage
              src={hero.image}
              alt={hero.title}
              title={hero.title}
              fill
              sizes="100px"
              className="object-cover"
              fallbackClassName="absolute inset-0 w-full h-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="label-sm text-wine/80">Headlining your order</p>
          <h2 className="serif text-xl lg:text-2xl text-ink leading-tight mt-1 line-clamp-2">
            {hero.title}
          </h2>
          <p className="text-xs text-ink-dim mt-1">
            Size {hero.size}{hero.qty > 1 ? ` · Qty ${hero.qty}` : ""}
          </p>

          <div className="mt-auto pt-3 flex items-center justify-between">
            <p className="text-xs text-ink-dim">ETA {etaLabel}</p>
            <span className="text-sm font-semibold text-ink">{rupees(hero.price * hero.qty)}</span>
          </div>
        </div>
      </div>

      {/* Expand toggle ,only if more items */}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 lg:px-5 py-2.5 border-t border-line/40 text-xs text-wine font-semibold hover:bg-wine/5 transition-colors"
        >
          <span>{open ? "Hide items" : `+ ${rest.length} more item${rest.length > 1 ? "s" : ""} in this order`}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* Expanded items */}
      {open && (rest.length > 0) && (
        <div className="border-t border-line/40 divide-y divide-line/30">
          {rest.map((line, i) => (
            <div key={i} className="flex gap-3 px-4 lg:px-5 py-3 items-center">
              {line.image && (
                <div className="relative w-14 h-16 flex-shrink-0 bg-surface-2 overflow-hidden rounded-[2px]">
                  <SafeImage
                    src={line.image}
                    alt={line.title}
                    title={line.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    fallbackClassName="absolute inset-0 w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-semibold leading-snug line-clamp-2">{line.title}</p>
                <p className="text-xs text-ink-dim mt-0.5">
                  Size {line.size}{line.qty > 1 ? ` · Qty ${line.qty}` : ""}
                </p>
              </div>
              <p className="text-sm font-semibold text-ink shrink-0">{rupees(line.price * line.qty)}</p>
            </div>
          ))}
        </div>
      )}

    </article>
  );
}
