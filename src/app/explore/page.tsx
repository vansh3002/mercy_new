import { productRepository } from "@/lib/data-source";
import { ProductList } from "@/components/ProductList";
import { LotusMark } from "@/components/brand/LotusMark";

export const metadata = {
  title: "Explore Collection ,Womaniya",
  description:
    "Discover our full collection ,trending styles, chikankari kurtas, festive sets and everyday wear. Curated by Mercy.",
};

export default async function ExplorePage() {
  const repo = productRepository();

  // Fetch both collections
  const festive = await repo.list({ collection: "festive-edit", sort: "popular" });
  const everyday = await repo.list({ mood: "everyday", sort: "popular" });
  const all = await repo.list({ sort: "popular" });

  // Merge and deduplicate: interleave trending + chikankari for a mixed feel
  const seen = new Set<string>();
  const mixed: typeof all = [];

  const maxLen = Math.max(festive.length, everyday.length);
  for (let i = 0; i < maxLen; i++) {
    if (festive[i] && !seen.has(festive[i].id)) {
      seen.add(festive[i].id);
      mixed.push(festive[i]);
    }
    if (everyday[i] && !seen.has(everyday[i].id)) {
      seen.add(everyday[i].id);
      mixed.push(everyday[i]);
    }
  }
  // Append any remaining products not yet included
  for (const p of all) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      mixed.push(p);
    }
  }

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
            <LotusMark className="w-[18px] h-[18px] text-gold/80" />
            <h1 className="serif text-xl sm:text-2xl lg:text-3xl text-on-accent tracking-tight">
              Explore Collection
            </h1>
            {/* Gold rule */}
            <div className="flex items-center gap-2 w-28">
              <span className="flex-1 h-px bg-gold/40" />
              <LotusMark className="w-2.5 h-2.5 text-gold/60" />
              <span className="flex-1 h-px bg-gold/40" />
            </div>
            <p className="serif text-[13px] font-bold italic text-gold/80 -mt-0.5">
              Trending Styles & Chikankari ,Chosen by Mercy
            </p>
          </div>
        </div>
      </section>

      <div className="container-editorial py-8 lg:py-12">
        <ProductList products={mixed} showMoodFilter />
      </div>
    </div>
  );
}
