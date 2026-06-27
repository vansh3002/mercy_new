"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, ShieldCheck, Sparkles, Tag, Truck, X } from "lucide-react";
import type { CartView } from "@/features/cart/types";
import { rupees } from "@/lib/format";
import { SafeImage } from "./SafeImage";
import { OrderSummaryBox } from "./OrderSummaryBox";
import { OrnateDivider } from "./brand/OrnateDivider";
import { CheckoutStepper } from "./CheckoutStepper";
import {
  fetchCart,
  removeCartItem,
  updateCartQty,
  applyCouponClient,
} from "@/lib/cart-client";
import { useVerification } from "@/hooks/useVerification";

export function CartClient({ initial }: { initial: CartView | null }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartView | null>(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const { requireVerification, VerificationGate } = useVerification();

  useEffect(() => {
    if (!initial) {
      fetchCart().then(setCart);
    }
  }, [initial]);

  if (!cart) {
    return (
      <div className="container-boutique py-16 text-center">
        <p className="serif text-3xl text-ink">Loading your bag…</p>
      </div>
    );
  }

  const empty = cart.lines.length === 0;

  async function changeQty(itemId: string, qty: number) {
    setPending(itemId);
    const next = await updateCartQty(itemId, qty);
    if (next) setCart(next);
    setPending(null);
  }

  async function remove(itemId: string) {
    setPending(itemId);
    const next = await removeCartItem(itemId);
    if (next) setCart(next);
    setPending(null);
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponMsg(null);
    const next = await applyCouponClient(couponInput.trim());
    if (next) {
      setCart(next);
      setCouponMsg(
        next.coupon
          ? `Coupon ${next.coupon.code} applied. You saved ${rupees(next.coupon.amount)}.`
          : "Coupon not valid. Try WOMANIA100.",
      );
    }
  }

  function checkout() {
    requireVerification(() => router.push("/checkout"));
  }

  return (
    <div className="container-editorial py-6 lg:py-10">
      {VerificationGate}
      <header className="text-center mb-2">
        <span className="label text-wine/80">Your Bag</span>
        <h1 className="serif text-[28px] lg:text-[40px] text-ink mt-1">
          {cart.totals.itemsCount === 0 ? "Nothing here yet" : "Almost there"}
        </h1>
        <p className="text-xs text-ink-dim mt-1.5">
          {cart.totals.itemsCount === 0
            ? "Add a piece to get started"
            : `${cart.totals.itemsCount} ${cart.totals.itemsCount === 1 ? "piece" : "pieces"} · ready for checkout`}
        </p>
      </header>

      <CheckoutStepper active="bag" />
      <OrnateDivider width="md" className="mt-1 mb-6 lg:mb-10" />

      {empty ? (
        <div className="bg-cream-gradient border border-line/60 rounded-[2px] p-10 lg:p-16 text-center max-w-xl mx-auto shadow-card">
          <Sparkles
            size={28}
            strokeWidth={1.25}
            className="mx-auto text-gold"
            aria-hidden="true"
          />
          <p className="serif text-2xl lg:text-3xl text-ink mt-4">Your bag is empty.</p>
          <p className="text-sm text-ink-dim mt-2 max-w-sm mx-auto">
                  Find something you love from Mercy’s collection.
          </p>
          <div className="mt-7 flex items-center justify-center">
            <Link href="/explore" className="btn-wine">
              Explore Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-12 lg:items-start">
          <ul className="flex flex-col gap-4 lg:gap-5">
            {cart.lines.map((l) => {
              const isPending = pending === l.id;
              return (
                <li
                  key={l.id}
                  className="flex gap-3 lg:gap-5 p-3 lg:p-4 bg-surface border border-line/60 rounded-[2px] shadow-card hover:shadow-cardHover transition-shadow duration-300"
                >
                  <Link
                    href={`/product/${l.slug}`}
                    className="relative w-[110px] h-[140px] lg:w-[130px] lg:h-[170px] flex-shrink-0 bg-surface-2 overflow-hidden rounded-[2px]"
                  >
                    <SafeImage
                      src={l.image}
                      alt={l.title}
                      title={l.title}
                      fill
                      sizes="130px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      fallbackClassName="absolute inset-0 w-full h-full"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="serif text-lg lg:text-xl leading-tight text-ink line-clamp-2">
                          <Link href={`/product/${l.slug}`} className="hover:text-wine transition-colors">
                            {l.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-ink-dim mt-1 line-clamp-1">{l.subtitle}</p>
                        <p className="text-xs text-ink-faint mt-2 label-sm">
                          Size {l.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.id)}
                        aria-label={`Remove ${l.title}`}
                        disabled={isPending}
                        className="p-1.5 -mt-1 -mr-1 text-ink-faint hover:text-wine transition-colors rounded-full hover:bg-bg/60"
                      >
                        <X size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-ink font-semibold">{rupees(l.price)}</p>
                        <p className="text-xs text-ink-faint line-through">{rupees(l.mrp)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          role="group"
                          aria-label={`Quantity for ${l.title}`}
                          className="flex items-center border border-line h-9 rounded-full overflow-hidden bg-surface"
                        >
                          <button
                            type="button"
                            onClick={() => changeQty(l.id, l.qty - 1)}
                            disabled={isPending || l.qty <= 1}
                            aria-label="Decrease quantity"
                            className="w-9 h-full text-ink disabled:text-ink-faint hover:bg-bg/60 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center label-sm">{l.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(l.id, l.qty + 1)}
                            disabled={isPending || l.qty >= 10}
                            aria-label="Increase quantity"
                            className="w-9 h-full text-ink disabled:text-ink-faint hover:bg-bg/60 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {l.mrp > l.price && (
                        <span className="bg-gold/15 text-wine label-sm px-2.5 py-1 rounded-full">
                          You save {rupees((l.mrp - l.price) * l.qty)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-44 mt-8 lg:mt-0 flex flex-col gap-4">
            {/* Free shipping progress */}
            {cart.totals.freeShippingRemaining > 0 ? (
              <div className="bg-surface border border-line/60 rounded-[2px] p-4 shadow-card">
                <p className="text-sm text-ink-dim leading-relaxed">
                  <Truck size={14} className="inline mr-1.5 mb-0.5 text-wine" aria-hidden="true" />
                  You're <span className="text-wine font-semibold">{rupees(cart.totals.freeShippingRemaining)}</span> away from{" "}
                  <span className="text-success font-semibold">free shipping</span>.
                </p>
                <div className="mt-3 h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        (cart.totals.subtotal / cart.totals.freeShippingThreshold) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-success/10 text-success border border-success/30 rounded-[2px] p-4 text-sm inline-flex items-center gap-2 shadow-card">
                <Sparkles size={14} strokeWidth={1.75} className="text-success" aria-hidden="true" />
                You've unlocked free shipping.
              </div>
            )}

            {/* Coupon */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-neutral-500">Have a coupon code?</span>
                <span className="text-[11px] text-wine font-medium italic">Enter it below to save on your order</span>
              </div>
              <form
                onSubmit={applyCoupon}
                className="bg-surface border border-line/60 rounded-[2px] p-3 flex items-center gap-2 shadow-card focus-within:border-wine transition-colors"
                aria-label="Apply coupon"
              >
                <Tag size={16} className="text-gold ml-1" aria-hidden="true" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Try WOMANIA100"
                  aria-label="Coupon code"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <button
                  type="submit"
                  className="label text-wine hover:underline px-2"
                >
                  Apply <ChevronRight size={12} className="inline ml-0.5" />
                </button>
              </form>
            </div>
            {couponMsg && (
              <p className="text-xs text-ink-dim -mt-2">{couponMsg}</p>
            )}

            <OrderSummaryBox
              subtotal={cart.totals.subtotal}
              discount={cart.totals.discount}
              shipping={cart.totals.shipping}
              total={cart.totals.total}
            />

            <button
              type="button"
              onClick={checkout}
              className="btn-wine w-full !h-13 mt-1 text-[12px]"
              style={{ height: "52px" }}
            >
              Proceed to Checkout · {rupees(cart.totals.total)}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-ink-dim mt-1">
              <ShieldCheck size={14} className="text-success" aria-hidden="true" />
              Secure checkout · 100% encrypted
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
