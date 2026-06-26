"use client";

import type { Size } from "@/features/products/types";

const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

interface Props {
  available: Size[];
  value: Size | null;
  onChange: (s: Size) => void;
  className?: string;
}

export function SizeSelector({ available, value, onChange, className = "" }: Props) {
  return (
    <fieldset className={className}>
      <legend className="sr-only">Choose a size</legend>
      <div className="flex flex-nowrap gap-2.5 overflow-x-auto pb-1" role="radiogroup" aria-label="Size">
        {ALL_SIZES.map((s) => {
          const inStock = available.includes(s);
          const selected = value === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!inStock}
              onClick={() => inStock && onChange(s)}
              className={[
                "w-12 h-9 text-xs font-medium border rounded-[6px] flex items-center justify-center transition-all",
                selected
                  ? "bg-wine text-white border-wine"
                  : inStock
                  ? "bg-transparent text-neutral-800 border-neutral-200 hover:border-wine"
                  : "bg-transparent text-neutral-300 border-neutral-100 line-through cursor-not-allowed",
              ].join(" ")}
            >
              {s}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
