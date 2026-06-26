"use client";

import { ShoppingBag, Zap } from "lucide-react";

interface Props {
  onAddToBag: () => void;
  onBuyNow: () => void;
  addLabel?: string;
  buyLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  sticky?: boolean;
}

export function DualCTA({
  onAddToBag,
  onBuyNow,
  addLabel = "ADD TO BAG",
  buyLabel = "BUY NOW",
  disabled = false,
  loading = false,
  sticky = true,
}: Props) {
  return (
    <div
      className={[
        sticky
          ? "lg:static fixed inset-x-0 bottom-[64px] lg:bottom-auto z-20"
          : "",
        sticky
          ? "lg:bg-transparent lg:border-0 lg:shadow-none bg-surface/97 backdrop-blur border-t border-line/60 shadow-sticky safe-bottom"
          : "",
        "flex gap-3 px-4 py-3 lg:px-0 lg:py-0 w-full",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onAddToBag}
        disabled={disabled || loading}
        className="flex-1 h-11 md:h-12 border border-wine bg-[#FAF5F0]/30 hover:bg-wine/[0.04] text-wine serif text-[12px] font-semibold tracking-wider rounded-[8px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <ShoppingBag size={15} strokeWidth={1.5} className="text-wine" />
        <span>{loading ? "ADDING…" : addLabel.toUpperCase()}</span>
      </button>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={disabled || loading}
        className="flex-1 h-11 md:h-12 bg-wine hover:bg-wine-strong text-white border border-wine serif text-[12px] font-semibold tracking-wider rounded-[8px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <Zap size={15} fill="currentColor" strokeWidth={1.5} className="text-white" />
        <span>{buyLabel.toUpperCase()}</span>
      </button>
    </div>
  );
}
