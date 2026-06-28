import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";

export const dynamic = "force-dynamic";

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  const items = (order.items ?? []) as any[];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vaar5k9x/orders" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-5">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Items Ordered</h3>
            <div className="flex flex-col divide-y divide-gray-50">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-16 object-cover rounded-lg bg-gray-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} · Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{rupees(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{rupees(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>−{rupees(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{order.shippingCharge > 0 ? rupees(order.shippingCharge) : "Free"}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span><span>{rupees(order.finalAmount)}</span>
              </div>
              <p className="text-xs text-gray-400 pt-1">Payment: {order.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Delivery Address</h3>
            <p className="font-semibold text-gray-800">{order.customerName}</p>
            <p className="text-sm text-gray-500 mt-1">{order.address}</p>
            <p className="text-sm text-gray-500">{order.city}, {order.state} ,{order.pincode}</p>
            <p className="text-sm text-gray-500 mt-1">+91 {order.phone}</p>
          </div>

          {/* Tracking info */}
          {order.awbNumber && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Shipping Tracking</h3>
              <div className="space-y-1.5 text-sm">
                {order.shiprocketOrderId && (
                  <div className="flex gap-2"><span className="text-gray-400 w-36">Shiprocket ID</span><span className="font-mono text-gray-800">{order.shiprocketOrderId}</span></div>
                )}
                <div className="flex gap-2"><span className="text-gray-400 w-36">AWB Number</span><span className="font-mono text-gray-800">{order.awbNumber}</span></div>
                {order.trackingUrl && (
                  <div className="flex gap-2"><span className="text-gray-400 w-36">Tracking Link</span>
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B1A2F] hover:underline text-xs">{order.trackingUrl}</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div>
          <AdminOrderActions
            orderId={order.id}
            currentOrderStatus={order.orderStatus}
            currentPaymentStatus={order.paymentStatus}
          />
        </div>
      </div>
    </div>
  );
}
