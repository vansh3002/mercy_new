import { LotusMark } from "../brand/LotusMark";
import { Truck, RefreshCw, ShieldCheck, Lock, Package, Gem } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Free Shipping on Your First Order",
    sub: "No extra delivery charges",
  },
  {
    icon: Gem,
    title: "Curated Premium Fashion",
    sub: "Handpicked styles for you",
  },
  {
    icon: Package,
    title: "Fast Dispatch Across India",
    sub: "Quick order processing",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns Available",
    sub: "Hassle-free support",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    sub: "UPI Enabled Checkout",
  },
  {
    icon: Lock,
    title: "Shop With Confidence",
    sub: "Safe & trusted experience",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="bg-paper border-y border-line/50">
      <div className="container-editorial py-8 lg:py-12">
        <div className="flex items-center justify-center gap-2 mb-6 lg:mb-8 text-wine">
          <LotusMark className="w-3.5 h-3.5" />
          <p className="label">The Womaniya Promise</p>
          <LotusMark className="w-3.5 h-3.5" />
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 lg:gap-x-8">
          {ITEMS.map((it) => (
            <li key={it.title} className="flex items-start gap-3 text-left">
              <span className="inline-flex w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface border border-line/60 items-center justify-center text-wine shrink-0">
                <it.icon size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm lg:text-base font-semibold text-ink leading-tight">
                  {it.title}
                </p>
                <p className="text-xs text-ink-dim mt-0.5">{it.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
