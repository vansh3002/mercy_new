"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  ShieldCheck,
  Smartphone,
  Truck,
  LocateFixed,
  Loader2,
  PackageX,
  Bell,
} from "lucide-react";
import type { CartView } from "@/features/cart/types";
import type { PaymentMethod } from "@/features/checkout/types";
import { rupees } from "@/lib/format";
import { OrnateDivider } from "./brand/OrnateDivider";
import { CheckoutStepper } from "./CheckoutStepper";
import { OrderSummaryBox } from "./OrderSummaryBox";
import { SafeImage } from "./SafeImage";
import { placeOrder, removeCartItem } from "@/lib/cart-client";

const DEFAULT_ADDRESS = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  tag: "HOME" as const,
};

// Loads the Razorpay checkout.js script on demand
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

// Reverse geocode via our own server-side proxy (avoids browser CORS + User-Agent issues)
async function reverseGeocode(lat: number, lon: number) {
  const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;
  const data = await res.json() as {
    success: boolean;
    address?: { street: string; city: string; state: string; pincode: string };
  };
  return data.success ? data.address : null;
}

export function CheckoutClient({ cart, verifiedPhone }: { cart: CartView; verifiedPhone: string }) {
  const router = useRouter();
  const [address, setAddress] = useState({
    ...DEFAULT_ADDRESS,
    phone: verifiedPhone,
  });
  const [editing, setEditing] = useState(true); // start in edit mode so user fills address
  const [payment, setPayment] = useState<PaymentMethod>("RAZORPAY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfStock, setOutOfStock] = useState<{
    productTitle: string;
    size: string;
    image: string | null;
    cartLineId: string | null;
  } | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocationStatus("idle");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const a = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (!a) return;
          setAddress((prev) => ({
            ...prev,
            // Line 1 stays empty ,user fills house/flat number themselves
            // Line 2 gets the street/area from location
            line2: a.street || prev.line2,
            city: a.city || prev.city,
            state: a.state || prev.state,
            pincode: a.pincode || prev.pincode,
          }));
          setLocationStatus("granted");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationStatus("denied");
      },
      { timeout: 10000 }
    );
  }, []);

  // Auto-request location when checkout page mounts
  useEffect(() => { detectLocation(); }, [detectLocation]);

  function saveAddress() {
    const required: Array<{ key: keyof typeof address; label: string }> = [
      { key: "name",    label: "Full name is required" },
      { key: "line1",   label: "Address line 1 is required" },
      { key: "city",    label: "City is required" },
      { key: "state",   label: "State is required" },
      { key: "pincode", label: "Pincode is required" },
    ];
    const errors: Record<string, string> = {};
    for (const { key, label } of required) {
      if (!address[key]?.toString().trim()) errors[key] = label;
    }
    if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
      errors.pincode = "Enter a valid 6-digit pincode";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setEditing(false);
  }

  const codFee = 0;

  // When an item is out of stock, compute adjusted totals that exclude it
  const adjustedTotals = useMemo(() => {
    if (!outOfStock?.cartLineId) return cart.totals;
    const line = cart.lines.find((l) => l.id === outOfStock.cartLineId);
    if (!line) return cart.totals;
    const deduct = line.price * line.qty;
    return {
      ...cart.totals,
      subtotal: Math.max(0, cart.totals.subtotal - deduct),
      total: Math.max(0, cart.totals.total - deduct),
    };
  }, [outOfStock, cart.totals, cart.lines]);

  const finalTotal = useMemo(() => adjustedTotals.total + codFee, [adjustedTotals.total, codFee]);

  function handleOutOfStockError(productTitle?: string, size?: string) {
    const matchingLine = cart.lines.find(
      (l) => l.title === productTitle && l.size === size
    );
    setOutOfStock({
      productTitle: productTitle ?? "",
      size: size ?? "",
      image: matchingLine?.image ?? null,
      cartLineId: matchingLine?.id ?? null,
    });
  }

  async function submit() {
    setError(null);
    setLoading(true);

    // Silently remove out-of-stock item before paying
    if (outOfStock?.cartLineId) {
      await removeCartItem(outOfStock.cartLineId);
      setOutOfStock(null);
      setRequestSent(false);
    }

    // Razorpay online payment flow
    try {
      // 1. Pre-flight stock check before opening payment modal
      const stockRes = await fetch("/api/checkout/check-stock", { method: "POST" });
      const stockData = await stockRes.json();
      if (!stockData.success) {
        if (stockData.error === "insufficient_stock") {
          handleOutOfStockError(stockData.productTitle, stockData.size);
        } else {
          setError("Could not verify stock. Please try again.");
        }
        setLoading(false);
        return;
      }

      // 2. Load Razorpay SDK
      await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      const createRes = await fetch("/api/razorpay/create-order", { method: "POST" });
      const createData = await createRes.json();
      if (!createData.success) {
        setError(createData.error ?? "Failed to initiate payment");
        setLoading(false);
        return;
      }

      // 3. Open Razorpay modal
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.rzpOrderId,
        name: "Womaniya",
        description: "Fashion by Mercy",
        image: "/brand/womania-logo.jpg",
        prefill: {
          name: address.name,
          contact: `+91${address.phone}`,
        },
        theme: { color: "#8B1A2F" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Verify signature + place DB order
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.orderId) {
              router.push(`/orders/${verifyData.orderId}`);
            } else if (verifyData.error === "insufficient_stock") {
              handleOutOfStockError(verifyData.productTitle, verifyData.size);
              setLoading(false);
            } else {
              setError("Payment succeeded but order creation failed. Please contact support.");
              setLoading(false);
            }
          } catch (err) {
            console.error("[razorpay handler]", err);
            setError("Payment succeeded but we couldn't confirm your order. Please contact support with your payment ID.");
            setLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("[submit]", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function requestRestock() {
    if (!outOfStock) return;
    setRequesting(true);
    await fetch("/api/track/restock-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productTitle: outOfStock.productTitle, size: outOfStock.size }),
    });
    setRequesting(false);
    setRequestSent(true);
  }

  async function proceedWithoutItem() {
    if (!outOfStock?.cartLineId) return;
    setProceeding(true);
    await removeCartItem(outOfStock.cartLineId);
    setOutOfStock(null);
    setRequestSent(false);
    setProceeding(false);
    // Refresh server component so cart prop reflects the removed item
    router.refresh();
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
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="label text-wine inline-flex items-center gap-1 hover:underline"
                  aria-label="Edit address"
                >
                  <Pencil size={12} aria-hidden="true" /> Edit
                </button>
              )}
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
                {/* Location detect button */}
                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-wine text-wine text-xs font-semibold hover:bg-wine/5 transition-colors disabled:opacity-50"
                  >
                    {locating
                      ? <><Loader2 size={13} className="animate-spin" /> Detecting…</>
                      : <><LocateFixed size={13} /> Use my location</>
                    }
                  </button>
                  {locationStatus === "granted" && (
                    <p className="text-xs text-success mt-1.5">Location fetched ✓</p>
                  )}
                  {locationStatus === "denied" && (
                    <p className="text-xs text-sale mt-1.5">Location denied ,fill address manually.</p>
                  )}
                </div>

                <Field label="Full name *" value={address.name}
                  error={fieldErrors.name}
                  onChange={(v) => { setAddress({ ...address, name: v }); setFieldErrors((e) => ({ ...e, name: "" })); }} />
                {/* Phone locked to OTP-verified number */}
                <div className="flex flex-col gap-1">
                  <span className="label text-ink-dim">Phone (verified)</span>
                  <div className="h-11 border border-line/50 bg-bg px-3.5 rounded-md text-sm text-ink-dim flex items-center gap-2">
                    <ShieldCheck size={14} className="text-success" />
                    +91 {address.phone}
                  </div>
                </div>
                <Field className="lg:col-span-2" label="House / Flat / Building *" value={address.line1}
                  error={fieldErrors.line1} placeholder="e.g. Flat 4B, Sunshine Apartments, MG Road"
                  onChange={(v) => { setAddress({ ...address, line1: v }); setFieldErrors((e) => ({ ...e, line1: "" })); }} />
                <Field className="lg:col-span-2" label="Area / Landmark (optional)" value={address.line2}
                  onChange={(v) => setAddress({ ...address, line2: v })} />
                <Field label="City *" value={address.city}
                  error={fieldErrors.city}
                  onChange={(v) => { setAddress({ ...address, city: v }); setFieldErrors((e) => ({ ...e, city: "" })); }} />
                <Field label="State *" value={address.state}
                  error={fieldErrors.state}
                  onChange={(v) => { setAddress({ ...address, state: v }); setFieldErrors((e) => ({ ...e, state: "" })); }} />
                <Field label="Pincode *" value={address.pincode} inputMode="numeric"
                  error={fieldErrors.pincode}
                  onChange={(v) => { setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) }); setFieldErrors((e) => ({ ...e, pincode: "" })); }} />
                <div className="lg:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={saveAddress}
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
            <p className="label text-wine/80 mb-3">Payment</p>
            <div className="flex items-center gap-3 p-3 lg:p-4 border border-wine bg-wine-soft/40 rounded-[2px] shadow-glow">
              <Smartphone size={18} strokeWidth={1.5} className="text-wine shrink-0" />
              <span>
                <span className="block text-sm text-ink font-semibold">Pay Online</span>
                <span className="block text-xs text-ink-dim">GPay, PhonePe, Paytm &amp; all UPI apps</span>
              </span>
            </div>
          </section>

          {error && (
            <p role="alert" className="text-sm text-sale">{error}</p>
          )}

          {/* Out of stock card */}
          {outOfStock && (
            <section className="bg-surface border border-sale/30 rounded-[2px] overflow-hidden shadow-card">
              {/* Red header strip */}
              <div className="bg-sale/10 px-4 py-2.5 flex items-center gap-2 border-b border-sale/20">
                <PackageX size={15} className="text-sale shrink-0" />
                <p className="label text-sale">Out of Stock</p>
              </div>

              <div className="p-4 flex gap-4">
                {/* Product image */}
                {outOfStock.image && (
                  <div className="w-20 h-24 shrink-0 rounded-sm overflow-hidden bg-surface-2 border border-line/40">
                    <SafeImage
                      src={outOfStock.image}
                      alt={outOfStock.productTitle}
                      title={outOfStock.productTitle}
                      width={80}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-semibold leading-snug">
                    {outOfStock.productTitle}
                  </p>
                  <p className="text-xs text-ink-dim mt-0.5">Size: {outOfStock.size}</p>
                  <p className="text-sm text-ink-dim mt-2 leading-relaxed">
                    This item isn't available in your size right now.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Request button */}
                    {!requestSent ? (
                      <button
                        type="button"
                        onClick={requestRestock}
                        disabled={requesting || proceeding}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-wine text-wine text-xs font-semibold hover:bg-wine/5 transition-colors disabled:opacity-50"
                      >
                        {requesting
                          ? <><Loader2 size={12} className="animate-spin" /> Sending…</>
                          : <><Bell size={12} /> Request this item</>
                        }
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-success font-semibold">
                        <ShieldCheck size={12} /> Requested ✓
                      </span>
                    )}

                    {/* Remove from bag ,clears out-of-stock state so user can place order for rest */}
                    {outOfStock.cartLineId && (
                      <button
                        type="button"
                        onClick={proceedWithoutItem}
                        disabled={proceeding || requesting}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-sale/10 text-sale text-xs font-semibold hover:bg-sale/20 transition-colors disabled:opacity-50"
                      >
                        {proceeding
                          ? <><Loader2 size={12} className="animate-spin" /> Removing…</>
                          : "Remove from bag"
                        }
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-faint mt-2">
                    Remove this item to place your order for the remaining products.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-44 flex flex-col gap-4">
          <OrderSummaryBox
            subtotal={adjustedTotals.subtotal}
            discount={adjustedTotals.discount}
            shipping={adjustedTotals.shipping}
            codFee={codFee}
            total={finalTotal}
            lines={cart.lines}
            outOfStockLineId={outOfStock?.cartLineId ?? null}
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading || editing || proceeding}
            className="btn-wine w-full disabled:opacity-50"
            style={{ height: "52px" }}
          >
            {loading
              ? (payment === "RAZORPAY" ? "Opening payment…" : "Placing order…")
              : outOfStock
                ? `Place Order (skip out-of-stock) · ${rupees(finalTotal)}`
                : payment === "RAZORPAY"
                  ? `Pay ${rupees(finalTotal)} Securely`
                  : `Place Order · ${rupees(finalTotal)}`
            }
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-dim">
            <ShieldCheck size={14} className="text-success" aria-hidden="true" />
            Secured by Razorpay · 256-bit encryption
          </div>
          <p className="text-[11px] text-ink-faint text-center leading-relaxed">
            By placing this order you agree to Womaniya's policies, terms of service
            and 1-day return policy.
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
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="label text-ink-dim">{label}</span>
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 border bg-surface px-3.5 rounded-md text-sm text-ink focus:outline-none transition-all ${
          error
            ? "border-sale focus-visible:border-sale focus-visible:shadow-none"
            : "border-line focus-visible:border-wine focus-visible:shadow-glow"
        }`}
      />
      {error && <p className="text-xs text-sale mt-0.5">{error}</p>}
    </div>
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
