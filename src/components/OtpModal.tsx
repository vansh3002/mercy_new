"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, Loader2, RotateCcw } from "lucide-react";

type Step = "phone" | "otp" | "success";

interface OtpModalProps {
  onVerified: (phone: string) => void;
  onClose: () => void;
}

export function OtpModal({ onVerified, onClose }: OtpModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Focus phone input on open
  useEffect(() => {
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function sendOtp() {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "send_failed");
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cleaned = phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: cleaned, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          wrong_otp: `Wrong OTP.${data.remaining != null ? ` ${data.remaining} attempt${data.remaining !== 1 ? "s" : ""} left.` : ""}`,
          otp_expired: "OTP expired. Please request a new one.",
          too_many_attempts: "Too many wrong attempts. Request a new OTP.",
          otp_not_found: "OTP not found. Please request a new one.",
        };
        setError(msgs[data.error] ?? "Verification failed. Try again.");
        return;
      }
      setStep("success");
      setTimeout(() => onVerified(cleaned), 800);
    } catch {
      setError("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) {
    const val = e.key;
    if (/^\d$/.test(val)) {
      const next = [...otp];
      next[idx] = val;
      setOtp(next);
      if (idx < 5) otpRefs.current[idx + 1]?.focus();
      else {
        // auto-submit when last digit entered
        const code = next.join("");
        if (code.length === 6) {
          setOtp(next);
        }
      }
      e.preventDefault();
    } else if (val === "Backspace") {
      const next = [...otp];
      if (next[idx]) {
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus();
      }
      e.preventDefault();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Phone verification"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full sm:max-w-sm bg-surface border border-line/60 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-dim hover:text-ink transition-colors p-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ── Step: phone ────────────────────────────────── */}
        {step === "phone" && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-wine/10 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={22} className="text-wine" strokeWidth={1.5} />
              </div>
              <h2 className="serif text-2xl text-ink">Verify your number</h2>
              <p className="text-sm text-ink-dim mt-1">
                We'll send a one-time password to your mobile.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="label text-ink-dim">Mobile number</span>
              <div className="flex items-center border border-line rounded-md overflow-hidden focus-within:border-wine focus-within:shadow-glow transition-all bg-surface">
                <span className="px-3 text-sm text-ink-dim border-r border-line h-11 flex items-center">
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
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  className="flex-1 h-11 px-3 text-sm text-ink bg-transparent outline-none"
                />
              </div>
            </label>

            {error && (
              <p role="alert" className="text-xs text-sale mt-2">{error}</p>
            )}

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || phone.length < 10}
              className="btn-wine w-full mt-5 disabled:opacity-50"
              style={{ height: "48px" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        )}

        {/* ── Step: otp ──────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-wine/10 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={22} className="text-wine" strokeWidth={1.5} />
              </div>
              <h2 className="serif text-2xl text-ink">Enter OTP</h2>
              <p className="text-sm text-ink-dim mt-1">
                Sent to +91 {phone}
                <button
                  onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(null); }}
                  className="ml-1.5 text-wine underline text-xs"
                >
                  Change
                </button>
              </p>
            </div>

            {/* 6-box OTP input */}
            <div
              className="flex gap-2 justify-center"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={() => {}}
                  onKeyDown={(e) => handleOtpKey(e, i)}
                  className={[
                    "w-11 h-13 text-center text-xl font-bold text-ink border rounded-md outline-none transition-all",
                    digit
                      ? "border-wine bg-wine/5 shadow-glow"
                      : "border-line bg-surface",
                    "focus:border-wine focus:shadow-glow",
                  ].join(" ")}
                  style={{ height: "52px" }}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {error && (
              <p role="alert" className="text-xs text-sale mt-3 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading || otp.join("").length < 6}
              className="btn-wine w-full mt-5 disabled:opacity-50"
              style={{ height: "48px" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Verifying…
                </span>
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="text-center mt-4">
              {resendCooldown > 0 ? (
                <p className="text-xs text-ink-dim">
                  Resend OTP in{" "}
                  <span className="text-wine font-semibold">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={() => { setOtp(["","","","","",""]); setError(null); sendOtp(); }}
                  className="text-xs text-wine inline-flex items-center gap-1 hover:underline"
                >
                  <RotateCcw size={12} /> Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Step: success ──────────────────────────────── */}
        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={26} className="text-success" strokeWidth={1.5} />
            </div>
            <h2 className="serif text-2xl text-ink">Verified!</h2>
            <p className="text-sm text-ink-dim mt-1">Taking you to checkout…</p>
          </div>
        )}
      </div>
    </div>
  );
}
