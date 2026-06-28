import Image from "next/image";
import { rupees } from "@/lib/format";

interface Row {
  label: string;
  value: number;
  muted?: boolean;
}

interface LineItem {
  id: string;
  title: string;
  size: string;
  qty: number;
  price: number;
  image: string;
}

interface Props {
  subtotal: number;
  discount: number;
  shipping: number;
  codFee?: number;
  total: number;
  className?: string;
  lines?: LineItem[];
  outOfStockLineId?: string | null;
}

export function OrderSummaryBox({
  subtotal,
  discount,
  shipping,
  codFee = 0,
  total,
  className = "",
  lines = [],
  outOfStockLineId = null,
}: Props) {
  const rows: Row[] = [
    { label: "Subtotal", value: subtotal },
    { label: "Discount", value: -discount, muted: discount === 0 },
    {
      label: shipping === 0 ? "Shipping (Free)" : "Shipping",
      value: shipping,
      muted: shipping === 0,
    },
  ];
  if (codFee > 0) rows.push({ label: "COD fee", value: codFee });

  return (
    <div
      className={`bg-cream-gradient border border-line/60 rounded-[2px] p-4 lg:p-5 flex flex-col gap-2.5 shadow-card ${className}`}
    >
      <p className="label text-wine/80 mb-1">Order summary</p>

      {/* Product list */}
      {lines.length > 0 && (
        <div className="flex flex-col gap-3 pb-3 border-b border-line/40">
          {lines.map((line) => {
            const isOOS = line.id === outOfStockLineId;
            return (
              <div
                key={line.id}
                className={`flex items-center gap-3 transition-opacity ${isOOS ? "opacity-40" : ""}`}
              >
                <div className={`w-12 h-14 shrink-0 rounded-sm overflow-hidden bg-surface-2 border relative ${isOOS ? "border-sale/40" : "border-line/30"}`}>
                  <Image
                    src={line.image}
                    alt={line.title}
                    width={48}
                    height={56}
                    className={`w-full h-full object-cover ${isOOS ? "blur-[1.5px] grayscale" : ""}`}
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isOOS ? "text-ink-dim line-through" : "text-ink"}`}>
                    {line.qty > 1 ? `${line.qty} × ` : ""}{line.title}
                  </p>
                  <p className="text-[11px] text-ink-dim mt-0.5">Size: {line.size}</p>
                  {isOOS && (
                    <p className="text-[10px] font-bold text-sale tracking-wide uppercase mt-0.5">
                      Out of stock
                    </p>
                  )}
                </div>
                <p className={`text-xs font-semibold shrink-0 ${isOOS ? "text-ink-faint line-through" : "text-ink"}`}>
                  {rupees(line.price * line.qty)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between text-sm"
        >
          <span className={r.muted ? "text-ink-faint" : "text-ink-dim"}>{r.label}</span>
          <span className={r.muted ? "text-ink-faint" : "text-ink"}>
            {r.value < 0 ? `- ${rupees(Math.abs(r.value))}` : rupees(r.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-line/60 mt-1.5 pt-3.5 flex items-baseline justify-between">
        <span className="label text-ink-dim">Total</span>
        <span className="serif text-2xl lg:text-3xl text-wine">{rupees(total)}</span>
      </div>
      <p className="text-[10px] text-ink-faint tracking-wider uppercase mt-1">
        Inclusive of all taxes
      </p>
    </div>
  );
}
