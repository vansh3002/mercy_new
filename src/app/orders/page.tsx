"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, ShoppingBag, Package, Phone } from "lucide-react";
import { OtpModal } from "@/components/OtpModal";

type OrderSummary = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  finalAmount: number;
  createdAt: string;
};

function statusLabel(status: string) {
  const map: Record<string, string> = {
    UNDER_PACKAGING: "Being prepared",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[status] ?? status;
}

export default function OrdersPage() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/orders", { cache: "no-store" });
      const data = await res.json() as { orders: OrderSummary[] };
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function checkVerification() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json() as { verified: boolean };
    if (data.verified) {
      setVerified(true);
      fetchOrders();
    } else {
      setVerified(false);
    }
  }

  useEffect(() => { checkVerification(); }, []);

  function handleVerified() {
    setShowGate(false);
    setVerified(true);
    fetchOrders();
  }

  // Initial load
  if (verified === null) return null;

  return (
    <div className="min-h-screen">
      {showGate && (
        <OtpModal
          onVerified={handleVerified}
          onClose={() => setShowGate(false)}
        />
      )}

      {/* Header */}
      <section className="bg-[#FAF5F0] border-b border-line/40 py-4">
        <div className="container-editorial flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-wine" strokeWidth={1.75} />
            <h1 className="serif text-xl text-ink">My Orders</h1>
          </div>
          {verified && orders.length > 0 && (
            <span className="text-xs text-ink-dim">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </div>
      </section>

      <div className="container-editorial py-8">
        {!verified ? (
          /* Phone gate */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-wine/10 flex items-center justify-center">
              <Phone size={36} className="text-wine" strokeWidth={1.25} />
            </div>
            <div>
              <h2 className="serif text-2xl text-ink mb-2">Verify your number</h2>
              <p className="text-sm text-ink-dim leading-relaxed">
                Enter your mobile number to view your orders.
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
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-wine/30 border-t-wine animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center">
              <Package size={36} className="text-ink-dim/50" strokeWidth={1.25} />
            </div>
            <div>
              <h2 className="serif text-2xl text-ink mb-2">No orders yet</h2>
              <p className="text-sm text-ink-dim leading-relaxed">
                Once you place an order, you can track it here.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 h-12 px-8 bg-wine text-on-accent rounded-full label text-xs tracking-widest uppercase hover:bg-wine/90 transition-colors"
            >
              <ShoppingBag size={15} strokeWidth={1.75} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 max-w-lg mx-auto">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 p-4 bg-surface border border-line/60 rounded-sm shadow-card hover:border-wine/40 hover:shadow-cardHover transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-wine/10 flex items-center justify-center flex-shrink-0">
                      <Receipt size={16} className="text-wine" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="serif text-base text-ink font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-ink-dim mt-0.5">{statusLabel(order.orderStatus)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-wine">₹{order.finalAmount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-ink-dim mt-0.5">Track →</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
