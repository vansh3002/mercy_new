import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  UNDER_PACKAGING: "bg-amber-100 text-amber-700",
  SHIPPED:         "bg-blue-100 text-blue-700",
  DELIVERED:       "bg-green-100 text-green-700",
  CANCELLED:       "bg-red-100 text-red-600",
};

const PAY_BADGE: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED:  "bg-red-100 text-red-600",
};

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders <span className="text-gray-400 font-normal text-base">({orders.length})</span></h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => {
                const items = (o.items ?? []) as any[];
                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-[#8B1A2F] font-semibold">{o.orderNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 text-sm">{o.customerName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">+91 {o.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{rupees(o.finalAmount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${PAY_BADGE[o.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${STATUS_BADGE[o.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                        {o.orderStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/vaar5k9x/orders/${o.id}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#8B1A2F] transition-colors">
                        View <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
