import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/features/products/types";
import { ProductRail } from "./ProductRail";

interface Props {
  title: string;
  eyebrow?: string;
  href?: string;
  hrefLabel?: string;
  products: Product[];
}

/** Section wrapper around ProductRail for use on PDP / cart / order pages. */
export function RelatedRail({ title, eyebrow, href, hrefLabel, products }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="container-editorial pt-14 lg:pt-20 pb-2">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          {eyebrow && <span className="label text-wine/80">{eyebrow}</span>}
          <h2 className="mt-2 serif text-[24px] lg:text-[32px] leading-tight text-ink">
            {title}
          </h2>
        </div>
        {href && hrefLabel && (
          <Link
            href={href}
            className="hidden sm:inline-flex items-center gap-1.5 label text-wine hover:gap-2.5 transition-all"
          >
            {hrefLabel} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
      <ProductRail products={products} itemsPerView={4} />
    </section>
  );
}
