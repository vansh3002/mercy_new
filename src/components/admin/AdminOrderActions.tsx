"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateOrderStatus } from "@/app/vaar5k9x/actions";

const ORDER_STATUSES = ["UNDER_PACKAGING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] as const;

const STATUS_BADGE: Record<string, string> = {
  UNDER_PACKAGING: "bg-amber-100 text-amber-700 border-amber-200",
  SHIPPED:         "bg-blue-100 text-blue-700 border-blue-200",
  DELIVERED:       "bg-green-100 text-green-700 border-green-200",
  CANCELLED:       "bg-red-100 text-red-600 border-red-200",
};

interface Props {
  orderId: string;
  currentOrderStatus: string;
  currentPaymentStatus: string;
}

export function AdminOrderActions({ orderId, currentOrderStatus, currentPaymentStatus }: Props) {
  const [orderStatus, setOrderStatus] = useState(currentOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      await adminUpdateOrderStatus(orderId, orderStatus, paymentStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Update Status</h3>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Order Status</label>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setOrderStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  orderStatus === s
                    ? STATUS_BADGE[s] ?? "bg-gray-100 text-gray-700 border-gray-200"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1.5">Payment Status</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPaymentStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  paymentStatus === s
                    ? "bg-[#8B1A2F] text-white border-[#8B1A2F]"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {paymentStatus === "SUCCESS" && currentPaymentStatus !== "SUCCESS" && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ Marking as SUCCESS will trigger Shiprocket order creation automatically.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="self-start px-5 py-2 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1525] transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
