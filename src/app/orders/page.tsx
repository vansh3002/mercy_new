"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, ShoppingBag, Package } from "lucide-react";

export default function OrdersPage() {
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const ids = JSON.parse(localStorage.getItem("wm_order_ids") ?? "[]") as string[];
      setOrderIds(ids);
    } catch {
      setOrderIds([]);
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#FAF5F0] border-b border-line/40 py-4">
        <div className="container-editorial flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-wine" strokeWidth={1.75} />
            <h1 className="serif text-xl text-ink">My Orders</h1>
          </div>
          {mounted && orderIds.length > 0 && (
            <span className="text-xs text-ink-dim">{orderIds.length} {orderIds.length === 1 ? "order" : "orders"}</span>
          )}
        </div>
      </section>

      <div className="container-editorial py-8">
        {!mounted ? null : orderIds.length === 0 ? (
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
            {orderIds.map((id) => (
              <li key={id}>
                <Link
                  href={`/orders/${id}`}
                  className="flex items-center justify-between gap-4 p-4 bg-surface border border-line/60 rounded-sm shadow-card hover:border-wine/40 hover:shadow-cardHover transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-wine/10 flex items-center justify-center flex-shrink-0">
                      <Receipt size={16} className="text-wine" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="serif text-base text-ink font-medium">{id}</p>
                      <p className="text-xs text-ink-dim mt-0.5">Tap to track your order</p>
                    </div>
                  </div>
                  <span className="text-wine text-xs font-semibold tracking-wide">Track →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
