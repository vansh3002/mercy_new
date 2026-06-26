"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { getWishlist, toggleWishlist } from "@/lib/wishlist-store";
import { ProductCardBoutique } from "@/components/ProductCardBoutique";
import { LotusMark } from "@/components/brand/LotusMark";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import type { Product } from "@/features/products/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  function syncWishlist() {
    setWishlistIds(getWishlist());
  }

  useEffect(() => {
    syncWishlist();
    window.addEventListener("wm:wishlist", syncWishlist);
    return () => window.removeEventListener("wm:wishlist", syncWishlist);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then(({ products: all }: { products: Product[] }) => {
        const ids = getWishlist();
        setProducts(all.filter((p) => ids.includes(p.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Re-filter when wishlist changes
  useEffect(() => {
    setProducts((prev) => {
      if (wishlistIds.length === 0) return [];
      return prev.filter((p) => wishlistIds.includes(p.id));
    });
  }, [wishlistIds]);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <section className="relative overflow-hidden bg-[#FAF5F0] border-b border-line/40 py-8 lg:py-12">
        <LotusMark className="absolute top-3 left-4 w-5 h-5 text-lotus/30 rotate-[-15deg]" />
        <LotusMark className="absolute top-3 right-4 w-5 h-5 text-lotus/30 rotate-[15deg]" />

        <div className="container-editorial text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart size={20} className="text-wine" strokeWidth={1.75} />
            <span className="label text-ink-dim tracking-widest uppercase text-xs">Your Saved Pieces</span>
          </div>
          <h1 className="serif text-3xl lg:text-4xl text-ink">Wishlist</h1>
          <OrnateDivider className="mx-auto mt-4 w-40 text-gold/60" />
          {!loading && wishlistIds.length > 0 && (
            <p className="mt-3 text-sm text-ink-dim">
              {wishlistIds.length} {wishlistIds.length === 1 ? "piece" : "pieces"} saved
            </p>
          )}
        </div>
      </section>

      <div className="container-editorial py-8 lg:py-12">
        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-sm bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center">
              <Heart size={36} className="text-ink-dim/50" strokeWidth={1.25} />
            </div>
            <div>
              <h2 className="serif text-2xl text-ink mb-2">Nothing saved yet</h2>
              <p className="text-sm text-ink-dim leading-relaxed">
                Tap the{" "}
                <Heart size={13} className="inline text-wine" strokeWidth={2} />
                {" "}on any product to save it here for later.
              </p>
            </div>
            <Link
              href="/festive-edit"
              className="inline-flex items-center gap-2 h-12 px-8 bg-wine text-on-accent rounded-full label text-xs tracking-widest uppercase hover:bg-wine/90 transition-colors"
            >
              <ShoppingBag size={15} strokeWidth={1.75} />
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCardBoutique key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
