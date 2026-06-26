import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { productRepository } from "@/lib/data-source";
import { ProductList } from "@/components/ProductList";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { LotusMark } from "@/components/brand/LotusMark";
import type { Mood } from "@/features/products/types";

const MOOD_LABELS: Record<Mood, { label: string; script: string; title: string; sub: string }> = {
  everyday: {
    label: "Chikankari Collection",
    script: "",
    title: "Chikankari Collection",
    sub: "Choosen by Mercy",
  },
  festive: {
    label: "Festive",
    script: "in bloom",
    title: "Festive in Bloom.",
    sub: "Hand-finished sets, statement chikan, aari florals — for the evenings to remember.",
  },
  "light-wear": {
    label: "Light Wear",
    script: "barely there",
    title: "Featherweight, all summer.",
    sub: "Pastel tunics in the softest mul cottons — designed to almost not be there.",
  },
  "tea-time": {
    label: "Tea Time",
    script: "verandah hour",
    title: "The verandah collection.",
    sub: "Short dresses, bell sleeves, breezy florals — sunlit afternoons in a wardrobe.",
  },
};

const VALID: Mood[] = ["everyday", "festive", "light-wear", "tea-time"];

export function generateStaticParams() {
  return VALID.map((mood) => ({ mood }));
}

export async function generateMetadata({
  params,
}: {
  params: { mood: string };
}) {
  const m = params.mood as Mood;
  if (!VALID.includes(m)) return { title: "Collection" };
  const meta = MOOD_LABELS[m];
  return { title: `${meta.label} · ${meta.title}`, description: meta.sub };
}

export default async function CollectionPage({
  params,
}: {
  params: { mood: string };
}) {
  const mood = params.mood as Mood;
  if (!VALID.includes(mood)) notFound();
  const repo = productRepository();
  const products = await repo.list({ mood, sort: "popular" });
  const meta = MOOD_LABELS[mood];

  return (
    <div>
      {/* Editorial header */}
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
              {meta.title}
            </h1>
            {/* Gold rule */}
            <div className="flex items-center gap-2 w-28">
              <span className="flex-1 h-px bg-gold/40" />
              <LotusMark className="w-2.5 h-2.5 text-gold/60" />
              <span className="flex-1 h-px bg-gold/40" />
            </div>
            <p className="serif text-[13px] font-bold italic text-gold/80 -mt-0.5">
              {meta.sub}
            </p>
          </div>
        </div>
      </section>

      <div className="container-editorial py-8 lg:py-12">
        <ProductList products={products} showMoodFilter={false} />
      </div>
    </div>
  );
}
