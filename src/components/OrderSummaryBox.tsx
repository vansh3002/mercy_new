import { rupees } from "@/lib/format";

interface Row {
  label: string;
  value: number;
  muted?: boolean;
}

interface Props {
  subtotal: number;
  discount: number;
  shipping: number;
  codFee?: number;
  total: number;
  className?: string;
}

export function OrderSummaryBox({
  subtotal,
  discount,
  shipping,
  codFee = 0,
  total,
  className = "",
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
