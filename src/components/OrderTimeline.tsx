import { Check } from "lucide-react";
import type { OrderStatus } from "@/features/orders/types";

const STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: "placed", label: "Order placed", sub: "Confirmed" },
  { key: "tailored", label: "Tailored & QC done", sub: "Stitched and inspected" },
  { key: "out_for_delivery", label: "Out for delivery", sub: "With courier" },
  { key: "delivered", label: "Delivered", sub: "Enjoy your edit" },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="flex flex-col" aria-label="Order timeline">
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center border-2",
                  isDone
                    ? "bg-success border-success text-on-accent"
                    : isCurrent
                    ? "bg-wine border-wine text-on-accent"
                    : "bg-surface border-line text-ink-faint",
                ].join(" ")}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`flex-1 w-0.5 my-1 ${isDone ? "bg-success/60" : "bg-line/60"}`}
                />
              )}
            </div>
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p
                className={[
                  "text-sm font-semibold",
                  isCurrent ? "text-wine" : isDone ? "text-ink" : "text-ink-faint",
                ].join(" ")}
              >
                {step.label}
                {isDone && (
                  <span className="ml-2 inline-flex align-middle"><Check size={12} className="text-success" /></span>
                )}
              </p>
              <p className="text-xs text-ink-dim mt-0.5">{step.sub}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
