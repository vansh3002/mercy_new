import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShoppingBag, Package, TrendingUp, Clock, MessageCircle, BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  UNDER_PACKAGING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function AdminDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [orders, products, openQueries, todayViews] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany(),
    prisma.customerQuery.count({ where: { status: "OPEN" } }),
    prisma.pageView.findUnique({ where: { date: today } }),
  ]);

  const pending = orders.filter((o) => o.orderStatus === "UNDER_PACKAGING").length;
  const revenue = orders
    .filter((o) => o.orderStatus !== "CANCELLED")
    .reduce((sum, o) => sum + o.finalAmount, 0);
  const activeProducts = products.filter((p) => p.active).length;
  const recent = orders.slice(0, 6);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", href: "/vaar5k9x/orders" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/vaar5k9x/orders" },
    { label: "Revenue", value: rupees(revenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", href: null },
    { label: "Active Products", value: activeProducts, icon: Package, color: "text-purple-600", bg: "bg-purple-50", href: "/vaar5k9x/products" },
    { label: "Open Queries", value: openQueries, icon: MessageCircle, color: "text-rose-600", bg: "bg-rose-50", href: "/vaar5k9x/queries" },
    { label: "Today's Visitors", value: (todayViews?.count ?? 0).toLocaleString(), icon: BarChart2, color: "text-indigo-600", bg: "bg-indigo-50", href: "/vaar5k9x/traffic" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => {
          const card = (
            <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${s.href ? "hover:border-gray-200 hover:shadow-md transition-all" : ""}`}>
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>{card}</Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/vaar5k9x/orders" className="text-xs text-[#8B1A2F] hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-50">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/vaar5k9x/orders/${o.id}`} className="font-mono text-xs text-[#8B1A2F] hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{o.customerName}</p>
                    <p className="text-gray-400 text-xs">+91 {o.phone}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{rupees(o.finalAmount)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_BADGE[o.orderStatus] ?? "bg-gray-100 text-gray-600"}`}>
                      {o.orderStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
