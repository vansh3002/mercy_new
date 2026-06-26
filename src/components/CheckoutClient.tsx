"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Pencil,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import type { CartView } from "@/features/cart/types";
import type { PaymentMethod } from "@/features/checkout/types";
import { rupees } from "@/lib/format";
import { OrnateDivider } from "./brand/OrnateDivider";
import { CheckoutStepper } from "./CheckoutStepper";
import { OrderSummaryBox } from "./OrderSummaryBox";
import { SafeImage } from "./SafeImage";
import { placeOrder } from "@/lib/cart-client";

const DEFAULT_ADDRESS = {
  name: "Aanya Sharma",
  phone: "9876543210",
  line1: "12 Lotus Lane, Civil Lines",
  line2: "",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302006",
  tag: "HOME" as const,
};

const COD_FEE = 30;

export function CheckoutClient({ cart }: { cart: CartView }) {
  const router = useRouter();
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [editing, setEditing] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codFee = payment === "COD" ? COD_FEE : 0;
  const finalTotal = useMemo(() => cart.totals.total + codFee, [cart.totals.total, codFee]);

  async function submit() {
    setError(null);
    setLoading(true);
    const res = await placeOrder({ address, paymentMethod: payment });
    if ("error" in res) {
      setLoading(false);
      const friendly: Record<string, string> = {
        invalid_pincode: "Please enter a valid 6-digit pincode.",
        invalid_phone: "Please enter a valid 10-digit mobile number.",
        empty_cart: "Your bag is empty.",
      };
      setError(friendly[res.error] ?? "Could not place order. Please check your details.");
      return;
    }
    // Persist order ID to localStorage so the orders page can list it
    try {
      const existing = JSON.parse(localStorage.getItem("wm_order_ids") ?? "[]") as string[];
      localStorage.setItem("wm_order_ids", JSON.stringify([res.orderId, ...existing]));
    } catch {}
    router.push(`/orders/${res.orderId}`);
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container-boutique py-16 text-center">
        <p className="serif text-2xl text-ink">Your bag is empty</p>
        <p className="text-sm text-ink-dim mt-2">Add something before you checkout.</p>
        <Link href="/festive-edit" className="inline-block mt-6 btn-wine">
          Shop Festive
        </Link>
      </div>
    );
  }

  return (
    <div className="container-editorial py-4 lg:py-10">
      <div className="flex items-center justify-center relative mb-2">
        <Link
          href="/cart"
          aria-label="Back to bag"
          className="absolute left-0 p-2 -ml-2 text-ink hover:text-wine transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <p className="label text-wine/80">Checkout</p>
      </div>
      <CheckoutStepper active="address" />
      <OrnateDivider className="mt-1 mb-6 lg:mb-10" width="md" />

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-12 lg:items-start">
        <div className="flex flex-col gap-5 lg:gap-6">
          <section className="bg-surface border border-line/60 rounded-[2px] p-4 lg:p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="label text-wine/80">Delivery Address</p>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="label text-wine inline-flex items-center gap-1 hover:underline"
                aria-label="Edit address"
              >
                <Pencil size={12} aria-hidden="true" /> Edit
              </button>
            </div>
            {!editing ? (
              <div className="mt-4 flex flex-col gap-0.5 text-sm text-ink">
                <div className="flex items-center gap-2">
                  <p className="font-semibold serif text-lg">{address.name}</p>
                  {address.tag && (
                    <span className="label-sm bg-bg text-ink-dim px-2 py-0.5 rounded-full">
                      {address.tag}
                    </span>
                  )}
                </div>
                <p className="text-ink-dim mt-1">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p className="text-ink-dim">
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="text-ink-dim mt-1">+91 {address.phone}</p>
              </div>
            ) : (
              <form className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                <Field label="Full name" value={address.name}
                  onChange={(v) => setAddress({ ...address, name: v })} />
                <Field label="Phone" value={address.phone} inputMode="numeric"
                  onChange={(v) => setAddress({ ...address, phone: v.replace(/\D/g, "").slice(0, 10) })} />
                <Field className="lg:col-span-2" label="Address line 1" value={address.line1}
                  onChange={(v) => setAddress({ ...address, line1: v })} />
                <Field className="lg:col-span-2" label="Address line 2 (optional)" value={address.line2}
                  onChange={(v) => setAddress({ ...address, line2: v })} />
                <Field label="City" value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })} />
                <Field label="State" value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })} />
                <Field label="Pincode" value={address.pincode} inputMode="numeric"
                  onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
                <div className="lg:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-wine !h-11"
                  >
                    Save address
                  </button>
                </div>
              </form>
            )}
          </section>

          <Link
            href="/cart"
            className="bg-surface border border-line/60 rounded-[2px] p-4 lg:p-5 flex items-center gap-3 shadow-card hover:shadow-cardHover transition-shadow"
            aria-label="Review bag"
          >
            <div className="flex -space-x-3">
              {cart.lines.slice(0, 3).map((l) => (
                <div
                  key={l.id}
                  className="relative w-12 h-14 bg-surface-2 border-2 border-surface overflow-hidden rounded-sm"
                >
                  <SafeImage
                    src={l.image}
                    alt={l.title}
                    title={l.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    fallbackClassName="absolute inset-0 w-full h-full"
                  />
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="label text-ink-dim">{cart.totals.itemsCount} items in bag</p>
              <p className="serif text-lg text-ink mt-0.5">{rupees(cart.totals.total)}</p>
            </div>
            <ChevronRight size={18} className="text-ink-dim" aria-hidden="true" />
          </Link>

          <section className="bg-surface border border-line/60 rounded-[2px] p-4 lg:p-6 shadow-card">
            <p className="label text-wine/80 mb-3">Payment Method</p>
            <div className="flex flex-col gap-2.5">
              <PayOption
                value="UPI"
                active={payment === "UPI"}
                onSelect={setPayment}
                icon={<Smartphone size={18} strokeWidth={1.5} />}
                label="UPI"
                sub="Google Pay · PhonePe · Paytm"
              />
            </div>
          </section>

          {error && (
            <p role="alert" className="text-sm text-sale">{error}</p>
          )}
        </div>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-44 flex flex-col gap-4">
          <OrderSummaryBox
            subtotal={cart.totals.subtotal}
            discount={cart.totals.discount}
            shipping={cart.totals.shipping}
            codFee={codFee}
            total={finalTotal}
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading || editing}
            className="btn-wine w-full"
            style={{ height: "52px" }}
          >
            {loading ? "Placing order…" : `Place Order · ${rupees(finalTotal)}`}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-dim">
            <ShieldCheck size={14} className="text-success" aria-hidden="true" />
            100% secure checkout · UPI · COD
          </div>
          <p className="text-[11px] text-ink-faint text-center leading-relaxed">
            By placing this order you agree to Womaniya's policies, terms of service
            and 7-day return policy.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label text-ink-dim">{label}</span>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 border border-line bg-surface px-3.5 rounded-md text-sm text-ink focus:outline-none focus-visible:border-wine focus-visible:shadow-glow transition-all"
      />
    </label>
  );
}

function PayOption({
  value,
  active,
  onSelect,
  icon,
  label,
  sub,
}: {
  value: PaymentMethod;
  active: boolean;
  onSelect: (v: PaymentMethod) => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <label
      className={[
        "flex items-center gap-3 p-3 lg:p-4 cursor-pointer border rounded-[2px] transition-all",
        active
          ? "border-wine bg-wine-soft/40 shadow-glow"
          : "border-line bg-surface hover:border-wine/50",
      ].join(" ")}
    >
      <input
        type="radio"
        name="payment"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="accent-wine"
      />
      <span className="text-wine">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm text-ink font-semibold">{label}</span>
        <span className="block text-xs text-ink-dim">{sub}</span>
      </span>
    </label>
  );
}
