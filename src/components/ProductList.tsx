"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
import type { Product, SortKey, Size, Mood } from "@/features/products/types";
import { ProductCardBoutique } from "./ProductCardBoutique";

const ALL_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
const PRICE_BUCKETS = [
  { label: "Under Rs. 2,000", value: 2000 },
  { label: "Under Rs. 2,500", value: 2500 },
  { label: "Under Rs. 3,500", value: 3500 },
  { label: "Under Rs. 5,000", value: 5000 },
];
const MOODS: { label: string; value: Mood }[] = [
  { label: "Everyday", value: "everyday" },
  { label: "Festive", value: "festive" },
  { label: "Light Wear", value: "light-wear" },
  { label: "Tea Time", value: "tea-time" },
];

const SORTS: { label: string; value: SortKey }[] = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface Props {
  products: Product[];
  showMoodFilter?: boolean;
}

export function ProductList({ products, showMoodFilter = true }: Props) {
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [size, setSize] = useState<Size | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const colourOptions = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    for (const p of products) {
      if (p.colorName && p.colorHex && !seen.has(p.colorName)) {
        seen.set(p.colorName, { name: p.colorName, hex: p.colorHex });
      }
    }
    return Array.from(seen.values());
  }, [products]);

  const filtered = useMemo(() => {
    let out = products.slice();
    if (size) out = out.filter((p) => p.sizes.includes(size));
    if (typeof maxPrice === "number") out = out.filter((p) => p.price <= maxPrice);
    if (mood) out = out.filter((p) => p.mood === mood);
    switch (sort) {
      case "new":
        out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        out.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out.sort((a, b) => b.price - a.price);
        break;
      default:
        out.sort((a, b) => b.popularity - a.popularity);
    }
    return out;
  }, [products, sort, size, maxPrice, mood]);

  const activeCount =
    (size ? 1 : 0) +
    (typeof maxPrice === "number" ? 1 : 0) +
    (mood ? 1 : 0);

  function clearAll() {
    setSize(null);
    setMaxPrice(null);
    setMood(null);
  }

  const FilterPanel = (
    <div className="flex flex-col gap-7 text-sm">
      <FilterBlock label="Size">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(active ? null : s)}
                aria-pressed={active}
                className={[
                  "h-9 min-w-9 px-2 label-sm rounded-full border transition-colors",
                  active
                    ? "bg-wine text-on-accent border-wine"
                    : "border-line text-ink hover:border-wine",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterBlock>

      <FilterBlock label="Price">
        <div className="flex flex-col gap-1.5">
          {PRICE_BUCKETS.map((b) => (
            <label
              key={b.value}
              className="flex items-center gap-2.5 cursor-pointer py-1 group"
            >
              <span
                className={[
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  maxPrice === b.value
                    ? "border-wine"
                    : "border-line group-hover:border-wine",
                ].join(" ")}
              >
                <span
                  className={[
                    "w-2 h-2 rounded-full transition-transform",
                    maxPrice === b.value ? "bg-wine scale-100" : "scale-0",
                  ].join(" ")}
                />
              </span>
              <input
                type="radio"
                name="price"
                className="sr-only"
                checked={maxPrice === b.value}
                onChange={() => setMaxPrice(b.value)}
              />
              <span className="text-ink">{b.label}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setMaxPrice(null)}
            className="label-sm text-ink-faint mt-1 hover:text-wine self-start"
          >
            Clear price
          </button>
        </div>
      </FilterBlock>

      {showMoodFilter && (
        <FilterBlock label="Mood">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const active = mood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(active ? null : m.value)}
                  aria-pressed={active}
                  className={[
                    "h-9 px-3.5 label-sm rounded-full border transition-colors",
                    active
                      ? "bg-wine text-on-accent border-wine"
                      : "border-line text-ink hover:border-wine",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </FilterBlock>
      )}
    </div>
  );

  const ActiveChips = (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      {size && (
        <Chip onClear={() => setSize(null)}>Size {size}</Chip>
      )}
      {typeof maxPrice === "number" && (
        <Chip onClear={() => setMaxPrice(null)}>
          Under Rs. {maxPrice.toLocaleString("en-IN")}
        </Chip>
      )}
      {mood && (
        <Chip onClear={() => setMood(null)} className="capitalize">
          {mood.replace("-", " ")}
        </Chip>
      )}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="label-sm text-ink-faint hover:text-wine ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside className="hidden lg:block">
        <div className="sticky top-44">
          <p className="serif text-2xl text-ink mb-5">Refine</p>
          {FilterPanel}
        </div>
      </aside>

      <div>
        <div className="flex items-center gap-3 mb-2 lg:mb-3">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="lg:hidden h-9 px-3 inline-flex items-center gap-2 border-2 border-wine/20 bg-surface text-wine label-sm rounded-full hover:border-wine hover:bg-wine/5 transition-all"
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
            FILTER
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-wine text-on-accent text-[9px] font-semibold">
                {activeCount}
              </span>
            )}
          </button>
          <p className="text-[11px] text-ink-dim hidden sm:block">
            <span className="text-ink font-semibold">{filtered.length}</span> styles
          </p>
          <div className="relative ml-auto group">
            <label className="sr-only" htmlFor="sort-by">Sort</label>
            <select
              id="sort-by"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 pl-3.5 pr-8 border-2 border-wine/20 bg-surface text-wine label-sm rounded-full appearance-none cursor-pointer hover:border-wine hover:bg-wine/5 transition-all outline-none focus:border-wine focus:ring-0"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="text-ink bg-surface text-xs">
                  {s.label.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wine pointer-events-none transition-transform group-hover:translate-y-[-40%]"
              aria-hidden="true"
            />
          </div>
        </div>

        {activeCount > 0 && ActiveChips}

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="serif text-2xl text-ink">No matches in this edit.</p>
            <p className="text-sm text-ink-dim mt-2">Try clearing a filter.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 btn-ghost"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-5 lg:mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map((p, i) => (
              <ProductCardBoutique key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFilterOpen(false)}
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm animate-fade-in"
          />
          <aside className="absolute right-0 top-0 bottom-0 w-[90vw] max-w-sm bg-cream-gradient shadow-card p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <p className="serif text-2xl text-ink">Refine</p>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                aria-label="Close filters"
                className="p-2 -mr-2"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            {FilterPanel}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 h-12 border border-line label text-ink-dim rounded-full"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex-[1.4] btn-wine"
              >
                Show {filtered.length} results
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="label text-ink-dim mb-3">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  children,
  onClear,
  className = "",
}: {
  children: React.ReactNode;
  onClear: () => void;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-line bg-surface text-xs text-ink-dim ${className}`}
    >
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove filter"
        className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-bg text-ink-faint hover:text-wine transition-colors"
      >
        <X size={11} strokeWidth={2} />
      </button>
    </span>
  );
}
