import { Check } from "lucide-react";

export type CheckoutStep = "bag" | "address" | "pay";

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "bag", label: "Bag" },
  { key: "address", label: "Address" },
  { key: "pay", label: "Pay" },
];

export function CheckoutStepper({ active }: { active: CheckoutStep }) {
  const activeIdx = STEPS.findIndex((s) => s.key === active);
  return (
    <ol
      className="flex items-center justify-center gap-2 lg:gap-3 py-4 max-w-lg mx-auto"
      aria-label="Checkout progress"
    >
      {STEPS.map((s, idx) => {
        const isActive = idx === activeIdx;
        const isDone = idx < activeIdx;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={s.key} className="flex items-center gap-2 lg:gap-3 flex-1">
            <span
              className={[
                "flex items-center gap-2",
                isActive
                  ? "text-wine"
                  : isDone
                  ? "text-ink"
                  : "text-ink-faint",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-colors",
                  isDone
                    ? "bg-success border-success text-on-accent"
                    : isActive
                    ? "bg-wine border-wine text-on-accent shadow-glow"
                    : "bg-surface border-line text-ink-faint",
                ].join(" ")}
              >
                {isDone ? <Check size={12} strokeWidth={2.5} /> : idx + 1}
              </span>
              <span className="label-sm tracking-wider" aria-current={isActive ? "step" : undefined}>
                {s.label}
              </span>
            </span>
            {!isLast && (
              <span
                aria-hidden="true"
                className={[
                  "flex-1 h-px",
                  isDone ? "bg-success/60" : "bg-line",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
