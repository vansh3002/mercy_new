import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { productRepository } from "@/lib/data-source";
import { ProductList } from "@/components/ProductList";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { LotusMark } from "@/components/brand/LotusMark";
import { Sparkle } from "@/components/brand/Sparkle";

export const metadata = {
  title: "Festive Edit ,Festive in Bloom",
  description:
    "Hand-finished chikankari, aari embroidery, and statement sets ,the Womaniya Festive Edit, dispatched in 24 hours.",
};

export default async function FestiveEditPage() {
  const repo = productRepository();
  const festive = await repo.list({ collection: "festive-edit", sort: "popular" });
  const all = await repo.list({ sort: "popular" });
  const products = festive.length > 0 ? festive : all;

  return (
    <div>
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6B1F30 0%, #8B2D42 40%, #A33850 70%, #7B2438 100%)",
        }}
      >
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #D4956A 0%, transparent 65%)",
          }}
        />
        {/* Decorative corner lotus marks */}
        <LotusMark className="absolute top-3 left-4 w-5 h-5 text-gold/30 rotate-[-15deg]" />
        <LotusMark className="absolute top-3 right-4 w-5 h-5 text-gold/30 rotate-[15deg]" />

        <div className="container-editorial py-1.5 lg:py-2 relative">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-1">
            {/* Crest icon */}
            <LotusMark className="w-[18px] h-[18px] text-gold/80" />
            <h1 className="serif text-xl sm:text-2xl lg:text-3xl text-on-accent tracking-tight whitespace-nowrap">
              Trending Fashion
            </h1>
            {/* Gold rule */}
            <div className="flex items-center gap-2 w-28">
              <span className="flex-1 h-px bg-gold/40" />
              <LotusMark className="w-2.5 h-2.5 text-gold/60" />
              <span className="flex-1 h-px bg-gold/40" />
            </div>
            <p className="serif text-[13px] font-bold italic text-gold/80 -mt-0.5">
              Picked by Mercy
            </p>
          </div>
        </div>
      </section>

      <div className="container-editorial py-8 lg:py-12">
        <ProductList products={products} showMoodFilter />
      </div>
    </div>
  );
}
