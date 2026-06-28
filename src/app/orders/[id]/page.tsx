import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productRepository } from "@/lib/data-source";
import { OrderTimeline } from "@/components/OrderTimeline";
import { OrderSummaryBox } from "@/components/OrderSummaryBox";
import { OrderItemsAccordion } from "@/components/OrderItemsAccordion";
import { NeedHelpButton } from "@/components/NeedHelpButton";
import { RelatedRail } from "@/components/home/RelatedRail";

export const metadata = { title: "Order Tracking" };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const dbOrder = await prisma.order.findUnique({ where: { id: params.id } });
  if (!dbOrder) notFound();

  // IDOR protection: only allow the customer whose phone matches the order
  const cookieStore = cookies();
  const phoneRaw = cookieStore.get("wm_phone")?.value ?? "";
  const phone = phoneRaw.replace(/\D/g, "");
  if (!phone || phone !== (dbOrder.phone ?? "").replace(/\D/g, "")) {
    redirect("/orders");
  }

  // Map dbOrder (Prisma) -> Frontend Order interface
  const orderLines = (dbOrder.items ?? []) as any[];

  // Convert db OrderStatus string to frontend OrderStatus type
  let status: "placed" | "tailored" | "out_for_delivery" | "delivered" | "cancelled" = "placed";
  if (dbOrder.orderStatus === "SHIPPED") status = "out_for_delivery";
  else if (dbOrder.orderStatus === "DELIVERED") status = "delivered";
  else if (dbOrder.orderStatus === "UNDER_PACKAGING") status = "tailored";
  else if (dbOrder.orderStatus === "CANCELLED") status = "cancelled";

  const eta = new Date(dbOrder.createdAt.getTime() + 1000 * 60 * 60 * 24 * 5);
  const etaLabel = eta.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const order = {
    id: dbOrder.orderNumber,
    createdAt: dbOrder.createdAt.toISOString(),
    status,
    lines: orderLines,
    address: {
      name: dbOrder.customerName,
      phone: dbOrder.phone,
      line1: dbOrder.address,
      line2: "" as string, // Placeholder as dbOrder.address contains the combined address
      city: dbOrder.city,
      state: dbOrder.state,
      pincode: dbOrder.pincode,
    },
    paymentMethod: dbOrder.paymentMethod as any,
    totals: {
      subtotal: dbOrder.subtotal,
      discount: dbOrder.discount,
      shipping: dbOrder.shippingCharge,
      codFee: dbOrder.paymentMethod === "COD" ? 30 : 0,
      total: dbOrder.finalAmount,
      youSave: dbOrder.discount,
    },
    etaLabel,
  };

  const hero = order.lines[0];

  const repo = productRepository();
  const all = await repo.list({ sort: "popular" });
  const recs = all
    .filter((p) => !order.lines.find((l) => l.slug === p.slug))
    .slice(0, 6);

  return (
    <div className="container-editorial py-4 lg:py-12">
      <div className="flex items-center relative mb-6">
        <Link
          href="/"
          aria-label="Back"
          className="p-2 -ml-2 text-ink hover:text-wine transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:items-start">
        <div className="flex flex-col gap-6">
          {order.lines.length > 0 && (
            <OrderItemsAccordion lines={order.lines} etaLabel={order.etaLabel} />
          )}

          <section className="bg-surface border border-line/60 rounded-[2px] p-5 lg:p-6 shadow-card">
            <p className="label text-wine/80 mb-5">Track your order</p>
            <OrderTimeline status={order.status} />
          </section>
        </div>

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-44 flex flex-col gap-5">
          <section className="bg-surface border border-line/60 rounded-[2px] p-4 lg:p-5 shadow-card">
            <p className="label text-wine/80 mb-3">Delivering to</p>
            <p className="text-sm text-ink font-semibold serif text-lg">{order.address.name}</p>
            <p className="text-sm text-ink-dim mt-1">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
            </p>
            <p className="text-sm text-ink-dim">
              {order.address.city}, {order.address.state} {order.address.pincode}
            </p>
            <p className="text-sm text-ink-dim mt-1">+91 {order.address.phone}</p>
          </section>

          <OrderSummaryBox
            subtotal={order.totals.subtotal}
            discount={order.totals.discount}
            shipping={order.totals.shipping}
            codFee={order.totals.codFee}
            total={order.totals.total}
            lines={order.lines}
          />

          <p className="text-xs text-ink-dim text-center">
            {order.paymentMethod === "COD"
              ? "Paid via Cash on Delivery"
              : order.paymentMethod === "RAZORPAY"
              ? "Paid online via UPI / Card / Net Banking"
              : `Paid via ${order.paymentMethod}`}
          </p>

          <NeedHelpButton
            orderNumber={order.id}
            phone={dbOrder.phone}
            customerName={dbOrder.customerName}
          />

          <Link href="/explore" className="btn-wine w-full" style={{ height: "48px" }}>
            Keep shopping Mercy's Collection
          </Link>
        </aside>
      </div>

      {recs.length > 0 && (
        <RelatedRail
          eyebrow="While you wait"
          title="More from Mercy's Collection"
          href="/festive-edit"
          hrefLabel="View all"
          products={recs}
        />
      )}
    </div>
  );
}
