"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Loader2 } from "lucide-react";

interface OtpModalProps {
  onVerified: (phone: string) => void;
  onClose: () => void;
}

export function OtpModal({ onVerified, onClose }: OtpModalProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, []);

  async function handleVerify() {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "failed");
      // Tell WishlistContext to re-fetch from DB now that we're verified
      window.dispatchEvent(new CustomEvent("wm:verified"));
      setSuccess(true);
      setTimeout(() => onVerified(cleaned), 700);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet ,matches size drawer style */}
      <div className="relative w-full max-w-md bg-cream-gradient rounded-t-3xl p-5 shadow-card z-10 pb-8 animate-slide-up">
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-line mx-auto -mt-1 mb-4" />

        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={26} className="text-success" strokeWidth={1.5} />
            </div>
            <h2 className="serif text-xl text-ink">Number Confirmed!</h2>
            <p className="text-sm text-ink-dim mt-1">Just a moment…</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="serif text-lg font-semibold text-wine">Enter your number</h4>
                <p className="text-xs text-ink-faint mt-0.5">We'll use this to update you on your order</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-dim hover:text-ink font-semibold text-sm"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center border border-line rounded-xl overflow-hidden focus-within:border-wine transition-all bg-surface">
              <span className="px-4 text-sm text-ink-dim border-r border-line h-12 flex items-center font-medium">
                +91
              </span>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="flex-1 h-12 px-4 text-sm text-ink bg-transparent outline-none tracking-widest"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-sale mt-2">{error}</p>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || phone.length < 10}
              className={[
                "w-full h-12 mt-4 rounded-full text-[12px] font-semibold tracking-widest uppercase transition-all",
                phone.length >= 10 && !loading
                  ? "bg-wine text-on-accent hover:bg-wine/90 shadow-md"
                  : "bg-wine/30 text-on-accent/50 cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Confirming…
                </span>
              ) : (
                "Confirm & Continue"
              )}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
