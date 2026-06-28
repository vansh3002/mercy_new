"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Check, Heart, Plus, Sparkles } from "lucide-react";
import type { Product, Size } from "@/features/products/types";
import { rupees, showOffBadge } from "@/lib/format";
import { SafeImage } from "./SafeImage";
import { addToCart } from "@/lib/cart-client";
import { useVerification } from "@/hooks/useVerification";
import { useWishlist } from "@/context/WishlistContext";

const SIZE_HINTS = ["S", "M", "L", "XL"] as const;

interface Props {
  product: Product;
  /** Optional priority loading for above-fold rows. */
  priority?: boolean;
  /** Visual density ,"default" or "editorial" (slightly taller card). */
  density?: "default" | "editorial";
}

export function ProductCardBoutique({ product, priority = false, density = "default" }: Props) {
  const { isWishlisted, toggle: ctxToggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [hovering, setHovering] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [addingSize, setAddingSize] = useState<Size | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeDrawerOpen, setSizeDrawerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { requireVerification, VerificationGate } = useVerification();

  const off = showOffBadge(product.discountPct);
  const showHover = product.images.hover && product.images.hover !== product.images.grid;
  const isLow = product.stock > 0 && product.stock <= 8;

  const mainColor = product.colorHex || "#1E3A8A";
  const swatches = [
    mainColor,
    mainColor.toLowerCase() === "#e3838e" ? "#C02B3C" : "#E3838E",
    mainColor.toLowerCase() === "#a3b899" ? "#F4ECDF" : "#A3B899",
  ];

  async function handleBuyNow(size: Size) {
    setLoading(true);
    const res = await addToCart(product.id, size, 1);
    setLoading(false);
    if (res) {
      setSizeDrawerOpen(false);
      setSelectedSize(null);
      // Fire-and-forget intent signal ,doesn't block navigation
      fetch("/api/track/buynow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productTitle: product.title, size }),
      }).catch(() => {});
      router.push("/checkout");
      router.refresh();
    }
  }

  async function quickAdd(size: Size) {
    setAddingSize(size);
    const res = await addToCart(product.id, size, 1);
    setAddingSize(null);
    if (res) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setQuickOpen(false);
      }, 1300);
    }
  }

  return (
    <article
      className="group relative flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setQuickOpen(false);
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        className={[
          "relative block overflow-hidden bg-surface-2 rounded-[2px]",
          density === "editorial" ? "aspect-[4/5]" : "aspect-[3/4]",
          "shadow-card group-hover:shadow-cardHover transition-shadow duration-500",
        ].join(" ")}
        aria-label={`${product.title} ,${rupees(product.price)}`}
      >
        {/* Base image */}
        <SafeImage
          src={product.images.grid}
          alt={product.title}
          title={product.title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
          className={[
            "object-cover transition-all duration-[1100ms]",
            "group-hover:scale-[1.04]",
            showHover && hovering ? "opacity-0" : "opacity-100",
          ].join(" ")}
          fallbackClassName="absolute inset-0 w-full h-full"
        />

        {/* Hover image */}
        {showHover && (
          <SafeImage
            src={product.images.hover}
            alt={`${product.title} ,alternate view`}
            title={product.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
            className={[
              "object-cover absolute inset-0 transition-all duration-[1100ms]",
              hovering ? "opacity-100 scale-[1.04]" : "opacity-0",
            ].join(" ")}
            fallbackClassName="absolute inset-0 w-full h-full"
          />
        )}

        {/* Soft vignette */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

      </Link>

      {VerificationGate}

      {/* Wishlist */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          requireVerification(() => ctxToggle(product.id));
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-ink hover:text-wine shadow-sm transition-colors"
      >
        <Heart
          size={16}
          strokeWidth={1.75}
          className={wishlisted ? "fill-wine text-wine" : ""}
        />
      </button>

      {/* Detail */}
      <div className="pt-3 px-0.5 flex flex-col gap-1.5">
        <h3 className="serif text-[14px] leading-tight text-ink truncate">
          <Link href={`/product/${product.slug}`} className="hover:text-wine transition-colors">
            {product.title}
          </Link>
        </h3>
        <div className="flex items-baseline gap-1 mt-0.5 flex-nowrap overflow-hidden">
          <span className="serif font-bold text-wine whitespace-nowrap text-[17px]">{rupees(product.price)}</span>
          <span className="serif text-[13px] text-neutral-400 line-through whitespace-nowrap">{rupees(product.mrp)}</span>
          {off && (
            <span className="serif font-bold text-[#2B663B] whitespace-nowrap text-[13px]">
              {product.discountPct}% off
            </span>
          )}
        </div>        
        {/* Buy Now ,verify phone first, then open size drawer */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            requireVerification(() => setSizeDrawerOpen(true));
          }}
          className="w-full mt-2 h-10 bg-wine text-on-accent text-[11px] font-semibold tracking-wider rounded-md hover:bg-wine-strong transition-colors uppercase"
        >
          Buy Now
        </button>
      </div>

      <SizeDrawerPortal open={sizeDrawerOpen}>
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
          <div
            className="fixed inset-0 bg-ink/40"
            onClick={() => { setSizeDrawerOpen(false); setSelectedSize(null); }}
          />
          <div className="relative w-full max-w-md bg-cream-gradient rounded-t-3xl p-5 shadow-card animate-slide-up flex flex-col gap-3.5 z-10 pb-6">
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-line mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="serif text-lg font-semibold text-wine">Select Size</h4>
                <p className="text-xs text-ink-faint mt-0.5">{product.title}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSizeDrawerOpen(false); setSelectedSize(null); }}
                className="text-ink-dim hover:text-ink font-semibold text-sm"
              >
                Cancel
              </button>
            </div>

            {/* Size buttons ,tap to select */}
            <div className="flex items-center justify-center gap-2.5 my-0.5">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={[
                      "h-11 w-11 rounded-full border text-sm font-semibold transition-all",
                      isSelected
                        ? "border-wine bg-wine text-on-accent scale-105 shadow-md"
                        : "border-line bg-surface text-ink hover:border-wine hover:text-wine",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Buy Now CTA ,enabled only after a size is picked */}
            <button
              type="button"
              disabled={!selectedSize || loading}
              onClick={() => {
                if (selectedSize) handleBuyNow(selectedSize);
              }}
              className={[
                "w-full h-12 rounded-full text-[12px] font-semibold tracking-widest uppercase transition-all",
                selectedSize && !loading
                  ? "bg-wine text-on-accent hover:bg-wine/90 shadow-md"
                  : "bg-wine/30 text-on-accent/50 cursor-not-allowed",
              ].join(" ")}
            >
              {loading
                ? "Adding to Bag..."
                : selectedSize
                ? `Buy Now`
                : "Select a Size to Continue"}
            </button>
          </div>
        </div>
      </SizeDrawerPortal>
    </article>
  );
}

/** Renders children into document.body via a portal so that `fixed` positioning
 *  always anchors to the true viewport ,not to any parent stacking context. */
function SizeDrawerPortal({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !open) return null;
  return createPortal(children, document.body);
}
