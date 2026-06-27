"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Share2,
  Ruler,
  RefreshCw,
  ShieldCheck,
  Scissors,
  Truck,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { Product, Size } from "@/features/products/types";
import { rupees, showOffBadge, discountSaved } from "@/lib/format";
import { OrnateDivider } from "./brand/OrnateDivider";
import { LotusMark } from "./brand/LotusMark";
import { SafeImage } from "./SafeImage";
import { SizeSelector } from "./SizeSelector";
import { DualCTA } from "./DualCTA";
import { addToCart } from "@/lib/cart-client";
import { ProductCardBoutique } from "./ProductCardBoutique";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist-store";
import { useVerification } from "@/hooks/useVerification";

export function PdpClient({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: Product[];
}) {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<Size | null>(
    product.sizes[1] ?? product.sizes[0] ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const { requireVerification, VerificationGate } = useVerification();
  const pendingAction = useRef<"buy" | null>(null);

  // Sync with persistent wishlist store after mount
  useEffect(() => {
    setWishlisted(isWishlisted(product.id));
    const handler = () => setWishlisted(isWishlisted(product.id));
    window.addEventListener("wm:wishlist", handler);
    return () => window.removeEventListener("wm:wishlist", handler);
  }, [product.id]);
  const [descOpen, setDescOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);

  const images =
    product.images.pdp.length > 0 ? product.images.pdp : [product.images.grid];

  async function handle(action: "add" | "buy") {
    if (!size) {
      setError("Please choose a size");
      return;
    }
    setError(null);

    if (action === "buy") {
      // Gate Buy Now behind OTP — skipped automatically if already verified
      requireVerification(async () => {
        setLoading(true);
        const result = await addToCart(product.id, size, 1);
        setLoading(false);
        if (!result) { setError("Something went wrong."); return; }
        router.push("/checkout");
        router.refresh();
      });
      return;
    }

    // Add to bag — no verification needed
    setLoading(true);
    const result = await addToCart(product.id, size, 1);
    setLoading(false);
    if (!result) {
      setError("Something went wrong. Please try again.");
      return;
    }
    router.push("/cart");
    router.refresh();
  }

  const showOff = showOffBadge(product.discountPct);

  return (
    <>
      {VerificationGate}
      <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:items-start">
        {/* Gallery */}
        <section className="lg:sticky lg:top-32">
          <div className="relative aspect-[3/4] bg-surface-2 overflow-hidden rounded-[2px] shadow-card">
            <SafeImage
              key={images[activeImg]}
              src={images[activeImg]}
              alt={product.title}
              title={product.title}
              fill
              priority
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover animate-image-reveal"
              fallbackClassName="absolute inset-0 w-full h-full"
            />

            {/* Wishlist Button Overlay */}
            <button
              type="button"
              onClick={() => {
                const next = toggleWishlist(product.id);
                setWishlisted(next);
              }}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={wishlisted}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-ink hover:text-wine shadow-sm transition-colors z-10"
            >
              <Heart
                size={18}
                strokeWidth={1.75}
                className={wishlisted ? "fill-wine text-wine" : ""}
              />
            </button>

            {/* Share Button Overlay */}
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.title,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              aria-label="Share product"
              className="absolute top-[68px] right-4 w-11 h-11 rounded-full bg-surface/95 backdrop-blur flex items-center justify-center text-ink hover:text-wine shadow-sm transition-colors z-10"
            >
              <Share2
                size={18}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {/* Mobile dots */}
          {images.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 mt-3 lg:hidden"
              role="tablist"
              aria-label="Image gallery"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeImg}
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={[
                    "h-[3px] rounded-full transition-all duration-500",
                    i === activeImg ? "w-8 bg-wine" : "w-3 bg-line",
                  ].join(" ")}
                />
              ))}
            </div>
          )}

          {/* Desktop thumbs */}
          {images.length > 1 && (
            <div
              className="hidden lg:grid grid-cols-5 gap-2 mt-3"
              role="tablist"
              aria-label="Image gallery"
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeImg}
                  onClick={() => setActiveImg(i)}
                  className={[
                    "relative aspect-[3/4] overflow-hidden border-2 transition-all",
                    i === activeImg ? "border-wine shadow-glow" : "border-line/60 hover:border-wine/60",
                  ].join(" ")}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.title} thumbnail ${i + 1}`}
                    title={product.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                    fallbackClassName="absolute inset-0 w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Detail */}
        <section className="px-4 lg:px-0 pt-5 pb-12 lg:pb-0">

          {/* Title */}
          <h1 className="serif text-[18px] lg:text-[22px] font-semibold text-ink leading-tight mb-1">
            {product.title}
          </h1>

          {/* Price row */}
          <div className="flex items-baseline gap-2.5 flex-wrap mb-1.5 mt-0.5">
            <span className="serif text-[24px] font-bold text-wine leading-none">{rupees(product.price)}</span>
            <span className="text-sm text-neutral-400 line-through">{rupees(product.mrp)}</span>
            {showOff && (
              <span className="text-sm font-bold text-[#2B663B]">{product.discountPct}% OFF</span>
            )}
          </div>

          {/* Curated subtitle */}
          <p className="text-[13px] text-neutral-500 mb-5 font-serif italic">Chosen by Mercy</p>


          {/* Size */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-400 mb-2.5">Size</p>
            <SizeSelector
              available={product.sizes}
              value={size}
              onChange={(s) => {
                setSize(s);
                setError(null);
              }}
            />
            {error && (
              <p role="alert" className="text-xs text-sale mt-2">
                {error}
              </p>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block mb-6 max-w-lg">
            <DualCTA
              onAddToBag={() => handle("add")}
              onBuyNow={() => handle("buy")}
              loading={loading}
              sticky={false}
            />
          </div>

          {/* Trust strip — 3 cols in a bordered box */}
          <div className="grid grid-cols-3 divide-x divide-wine/10 border border-wine/10 rounded-xl bg-wine/[0.01] mb-6 w-full">
            <div className="flex flex-col items-center gap-1 py-3 px-2 text-center">
              <Truck size={16} strokeWidth={1.5} className="text-wine" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-ink leading-tight">Shipping</span>
              <span className="text-[11px] text-neutral-400">Pan India</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-3 px-2 text-center">
              <RefreshCw size={16} strokeWidth={1.5} className="text-wine" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-ink leading-tight">Easy Returns</span>
              <span className="text-[11px] text-neutral-400">7 Days</span>
            </div>
            <div className="flex flex-col items-center gap-1 py-3 px-2 text-center">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-wine" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-ink leading-tight">Secure Payments</span>
              <span className="text-[11px] text-neutral-400">100% Safe</span>
            </div>
          </div>

          {/* Disclosures */}
          <div className="border-t border-neutral-200 lg:max-w-lg">
            <Disclosure
              title="Product Details"
              icon={Scissors}
              open={descOpen}
              onToggle={() => setDescOpen((v) => !v)}
            >
              <p>{product.description}</p>
              {product.fabric && (
                <p className="mt-2"><strong>Fabric:</strong> {product.fabric}</p>
              )}
            </Disclosure>
            <Disclosure
              title="Shipping & Returns"
              icon={Truck}
              open={shipOpen}
              onToggle={() => setShipOpen((v) => !v)}
            >
              <p>
              Free shipping on your first order. Fast dispatch across India. 7-day easy returns and secure payments on every order.
              </p>
            </Disclosure>
            <Disclosure
              title="Size Guide"
              icon={Ruler}
              open={careOpen}
              onToggle={() => setCareOpen((v) => !v)}
            >
              <p>
                We recommend sizing up for a relaxed fit. Refer to our size chart for exact measurements.
                All garments are cut to Indian standard sizing.
              </p>
            </Disclosure>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-6 lg:max-w-lg">
              <span className="label text-wine/80 block mb-1">More From Mercy</span>
              <h2 className="serif text-[22px] lg:text-[26px] font-semibold text-ink leading-tight">
                Discover more styles you&apos;ll love
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {relatedProducts.slice(0, 8).map((p) => (
                  <ProductCardBoutique key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden">
        <DualCTA
          onAddToBag={() => handle("add")}
          onBuyNow={() => handle("buy")}
          loading={loading}
          sticky
        />
      </div>
    </>
  );
}

function TrustItem({
  icon: Icon,
  title,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-2.5 bg-surface/70 border border-line/50 rounded-[2px] p-3">
      <span className="inline-flex w-9 h-9 rounded-full bg-bg border border-line/60 items-center justify-center text-wine shrink-0">
        <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-ink font-semibold leading-tight">{title}</span>
        <span className="block text-xs text-ink-dim mt-0.5">{sub}</span>
      </span>
    </li>
  );
}

function Disclosure({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-neutral-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-ink">
          {Icon && <Icon size={16} strokeWidth={1.5} className="text-wine shrink-0" aria-hidden="true" />}
          {title}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`text-neutral-400 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={[
          "grid transition-all duration-500 ease-out text-sm text-neutral-500 leading-relaxed",
          open ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
