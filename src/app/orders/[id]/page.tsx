import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt, Sparkles } from "lucide-react";
import { getOrder } from "@/features/orders/store";
import { productRepository } from "@/lib/data-source";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { OrderTimeline } from "@/components/OrderTimeline";
import { OrderSummaryBox } from "@/components/OrderSummaryBox";
import { SafeImage } from "@/components/SafeImage";
import { RelatedRail } from "@/components/home/RelatedRail";

export const metadata = { title: "Order Tracking" };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = getOrder(params.id);
  if (!order) notFound();

  const createdLabel = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const hero = order.lines[0];

  const repo = productRepository();
  const all = await repo.list({ sort: "popular" });
  const recs = all
    .filter((p) => !order.lines.find((l) => l.slug === p.slug))
    .slice(0, 6);

  return (
    <div className="container-editorial py-4 lg:py-12">
      <div className="flex items-center justify-center relative mb-3">
        <Link
          href="/"
          aria-label="Back"
          className="absolute left-0 p-2 -ml-2 text-ink hover:text-wine transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div className="text-center">
          <span className="label text-wine/80 inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-gold" aria-hidden="true" />
            Order placed
          </span>
          <p className="serif text-2xl lg:text-3xl text-ink mt-1">{order.id}</p>
          <p className="text-xs text-ink-dim mt-1">Confirmed {createdLabel}</p>
        </div>
      </div>
      <OrnateDivider className="mt-2 mb-8" width="md" />

      <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:items-start">
        <div className="flex flex-col gap-6">
          {hero && (
            <article className="flex gap-4 bg-surface border border-line/60 rounded-[2px] p-4 lg:p-5 shadow-card">
              <div className="relative w-[100px] h-[120px] flex-shrink-0 bg-surface-2 overflow-hidden rounded-[2px]">
                <SafeImage
                  src={hero.image}
                  alt={hero.title}
                  title={hero.title}
                  fill
                  sizes="100px"
                  className="object-cover"
                  fallbackClassName="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="label-sm text-wine/80">Headlining your order</p>
                <h2 className="serif text-xl lg:text-2xl text-ink leading-tight mt-1 line-clamp-2">
                  {hero.title}
                </h2>
                <p className="text-xs text-ink-dim mt-1.5">
                  {order.lines.length > 1 ? `+ ${order.lines.length - 1} more · ` : ""}
                  ETA {order.etaLabel}
                </p>
                <button
                  type="button"
                  className="mt-auto label text-wine inline-flex items-center gap-1.5 hover:underline self-start"
                  aria-label="View invoice"
                >
                  <Receipt size={14} aria-hidden="true" /> View Invoice
                </button>
              </div>
            </article>
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
          />

          <p className="text-xs text-ink-dim text-center">
            Paid via {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}.
          </p>

          <Link href="/festive-edit" className="btn-wine w-full" style={{ height: "48px" }}>
            Keep shopping the Festive Edit
          </Link>
        </aside>
      </div>

      {recs.length > 0 && (
        <RelatedRail
          eyebrow="While you wait"
          title="More from the boutique"
          href="/festive-edit"
          hrefLabel="View all"
          products={recs}
        />
      )}
    </div>
  );
}
