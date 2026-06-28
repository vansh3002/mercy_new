"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Phone } from "lucide-react";
import { ProductCardBoutique } from "@/components/ProductCardBoutique";
import { LotusMark } from "@/components/brand/LotusMark";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { OtpModal } from "@/components/OtpModal";
import type { Product } from "@/features/products/types";

export default function WishlistPage() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadWishlist() {
    setLoading(true);
    try {
      // Fetch wishlist IDs from DB (uses wm_phone cookie server-side)
      const [wishlistRes, productsRes] = await Promise.all([
        fetch("/api/customer/wishlist", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      const { wishlist: ids } = await wishlistRes.json() as { wishlist: string[] };
      const { products: all } = await productsRes.json() as { products: Product[] };
      setProducts(all.filter((p) => ids.includes(p.id)));
    } finally {
      setLoading(false);
    }
  }

  async function checkVerification() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json() as { verified: boolean };
    if (data.verified) {
      setVerified(true);
      loadWishlist();
    } else {
      setVerified(false);
    }
  }

  useEffect(() => { checkVerification(); }, []);

  // Re-load when wishlist changes (e.g. user removes an item)
  useEffect(() => {
    if (!verified) return;
    const handler = () => loadWishlist();
    window.addEventListener("wm:wishlist", handler);
    return () => window.removeEventListener("wm:wishlist", handler);
  }, [verified]);

  function handleVerified() {
    setShowGate(false);
    setVerified(true);
    loadWishlist();
  }

  if (verified === null) return null;

  return (
    <div className="min-h-screen">
      {showGate && (
        <OtpModal
          onVerified={handleVerified}
          onClose={() => setShowGate(false)}
        />
      )}

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
          {verified && !loading && products.length > 0 && (
            <p className="mt-3 text-sm text-ink-dim">
              {products.length} {products.length === 1 ? "piece" : "pieces"} saved
            </p>
          )}
        </div>
      </section>

      <div className="container-editorial py-8 lg:py-12">
        {!verified ? (
          /* Phone gate */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-wine/10 flex items-center justify-center">
              <Phone size={36} className="text-wine" strokeWidth={1.25} />
            </div>
            <div>
              <h2 className="serif text-2xl text-ink mb-2">Verify your number</h2>
              <p className="text-sm text-ink-dim leading-relaxed">
                Enter your mobile number to see your saved pieces.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGate(true)}
              className="inline-flex items-center gap-2 h-12 px-8 bg-wine text-on-accent rounded-full label text-xs tracking-widest uppercase hover:bg-wine/90 transition-colors"
            >
              Enter Number
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-sm bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
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
              href="/explore"
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
