import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productRepository } from "@/lib/data-source";
import { CinematicHero } from "@/components/home/CinematicHero";
import { MoodTile } from "@/components/MoodTile";
import { ProductRail } from "@/components/home/ProductRail";
import { ProductCardBoutique } from "@/components/ProductCardBoutique";
import { ColorStories } from "@/components/home/ColorStories";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { Reveal } from "@/components/brand/Reveal";
import { WomaniyaWordmark } from "@/components/brand/WomaniyaWordmark";
import type { Mood, Product } from "@/features/products/types";

export const dynamic = "force-static";

const MOODS: { label: string; slug: Mood; script: string; caption: string }[] = [
  { label: "Everyday", slug: "everyday", script: "easy", caption: "Soft chikan for slow mornings" },
  { label: "Festive", slug: "festive", script: "in bloom", caption: "Embroidered sets and statement pieces" },
  { label: "Light Wear", slug: "light-wear", script: "barely there", caption: "Featherweight tunics and pastels" },
  { label: "Tea Time", slug: "tea-time", script: "verandah hour", caption: "Short dresses, bell sleeves, sunlit afternoons" },
] as const;

function pickBy<T extends { id: string }>(list: T[], n: number, fallback: T[] = list): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...list, ...fallback]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= n) break;
  }
  return out;
}

export default async function HomePage() {
  const repo = productRepository();
  const all = await repo.list({ sort: "popular" });

  const ivory =
    all.find((p) => p.slug === "ivory-chikan-palace-set") ??
    all.find((p) => p.slug === "ivory-floral-kurta-palazzo") ??
    all[0];

  const heroSlides = [
    {
      src: ivory?.images.pdp[0] ?? ivory?.images.grid,
      title: ivory?.title ?? "Festive in Bloom",
      caption: "Ivory Palace Chikan Set · The Festive Edit",
      href: ivory ? `/product/${ivory.slug}` : undefined,
    },
    {
      src: all.find((p) => p.slug === "noir-festive-floral-set")?.images.grid,
      title: "Noir Aari Festive Set",
      caption: "Aari embroidery on midnight cotton",
      href: "/product/noir-festive-floral-set",
    },
    {
      src: all.find((p) => p.slug === "ivory-floral-kurta-palazzo")?.images.grid,
      title: "Ivory Floral Kurta & Palazzo",
      caption: "Hand-block florals on soft cotton",
      href: "/product/ivory-floral-kurta-palazzo",
    },
    {
      src: all.find((p) => p.slug === "rose-pink-suit-set")?.images.grid,
      title: "Rose Pink Chikan Suit Set",
      caption: "Three-piece chikan in powder rose",
      href: "/product/rose-pink-suit-set",
    },
  ].filter((s): s is { src: string; title: string; caption: string; href?: string } => Boolean(s.src));

  const moodMap = new Map<Mood, { count: number; first?: Product }>();
  for (const p of all) {
    const m = moodMap.get(p.mood) ?? { count: 0 };
    moodMap.set(p.mood, { count: m.count + 1, first: m.first ?? p });
  }

  const festive = all.filter((p) => p.mood === "festive");
  const everyday = all.filter((p) => p.mood === "everyday");
  const lightWear = all.filter((p) => p.mood === "light-wear");
  const teaTime = all.filter((p) => p.mood === "tea-time");

  const bestsellers = [...all].sort((a, b) => b.popularity - a.popularity).slice(0, 8);

  const colorStories = [
    { label: "Ivory & White", swatch: "#F4ECDF", caption: "Heirloom calm — for weddings and Sundays alike",
      product: all.find((p) => p.slug === "ivory-chikan-palace-set") ?? all[0] },
    { label: "Royal Blue", swatch: "#2C4FB8", caption: "The wardrobe you keep reaching for",
      product: all.find((p) => p.slug === "royal-blue-chikan-kurta") ?? all[0] },
    { label: "Wine & Berry", swatch: "#7B1E2C", caption: "Deep, quiet, devastatingly elegant",
      product: all.find((p) => p.slug === "wine-chikan-kurta") ?? all[0] },
    { label: "Marigold Red", swatch: "#D8323D", caption: "For golden-hour evenings",
      product: all.find((p) => p.slug === "red-chikan-haveli-kurta") ?? all[0] },
    { label: "Sage & Green", swatch: "#7DC03C", caption: "A colour that always finds the light",
      product: all.find((p) => p.slug === "parrot-green-chikan-kurta") ?? all[0] },
    { label: "Blush & Peach", swatch: "#F6CDC2", caption: "The softest entry point to colour",
      product: all.find((p) => p.slug === "blush-pink-chikan-tunic") ?? all[0] },
  ].filter((s) => s.product);

  const moodTilesData = MOODS.map((m) => {
    const info = moodMap.get(m.slug);
    const featured =
      m.slug === "festive"
        ? all.find((p) => p.slug === "noir-festive-floral-set")
        : m.slug === "everyday"
        ? all.find((p) => p.slug === "charcoal-chikan-kurta")
        : m.slug === "light-wear"
        ? all.find((p) => p.slug === "lemon-yellow-chikan-kurta")
        : all.find((p) => p.slug === "sage-green-tea-dress");
    return {
      ...m,
      image: featured?.images.grid ?? info?.first?.images.grid,
      count: info?.count ?? 0,
    };
  });

  return (
    <>
      <CinematicHero
        slides={heroSlides}
        primaryHref="/festive-edit"
        primaryLabel="Shop the Festive Edit"
        secondaryHref="#shop-by-mood"
        secondaryLabel="Browse the Boutique"
        headline="A boutique where every kurta is finished by hand."
        subhead="Womaniya by Mercy — slow-stitched chikankari, festive aari and tea-time dresses from Lucknow."
        eyebrow="FW26 Lookbook · Festive in Bloom"
      />

      {/* Shop by mood */}
      <section id="shop-by-mood" className="container-editorial pt-16 lg:pt-24 pb-2">
        <Reveal>
          <SectionHeading
            eyebrow="Shop by Mood"
            title={
              <>
                Find your vibe
                <br />
                Wear WOMANIA by Mercy
              </>
            }
          />
        </Reveal>
      </section>







      {/* Bestsellers grid */}
      <section className="container-editorial pt-8 pb-16 lg:pt-12 lg:pb-24">
        <Reveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestsellers.map((p, i) => (
              <ProductCardBoutique key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </Reveal>
        <div className="mt-8 lg:mt-10 flex justify-center">
          <Link href="/festive-edit" className="btn-ghost">
            View all 19 styles <ArrowRight size={14} className="ml-2" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip />

      {/* Customer love */}
      <Testimonials />

      {/* Final brand bookend */}
      <section className="bg-paper border-t border-line/50">
        <div className="container-editorial py-14 lg:py-20 flex flex-col items-center text-center">
          <WomaniyaWordmark variant="stacked" tagline="Fashion by Mercy" showArch />
          <OrnateDivider width="md" className="mt-6" />
          <p className="mt-6 serif text-2xl lg:text-3xl text-ink max-w-xl text-balance">
            Styles you’ll love, chosen for every moment that matters.
          </p>
        </div>
      </section>
    </>
  );
}
