"use client";

import { useCallback, useState } from "react";
import { OtpModal } from "@/components/OtpModal";

interface UseVerificationReturn {
  /** Call this before any gated action. If already verified → runs action immediately.
   *  If not verified → shows OTP modal, then runs action after verification. */
  requireVerification: (onVerified: (phone: string) => void) => Promise<void>;
  /** Render this in your component tree — it's null when not needed */
  VerificationGate: React.ReactNode;
}

export function useVerification(): UseVerificationReturn {
  const [showOtp, setShowOtp] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<((phone: string) => void) | null>(null);

  const requireVerification = useCallback(async (onVerified: (phone: string) => void) => {
    // Check if already verified via cookie (server-side httpOnly read)
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json() as { verified: boolean; phone: string | null };

      if (data.verified && data.phone) {
        // ✅ Already verified — skip OTP, go straight to action
        onVerified(data.phone);
        return;
      }
    } catch {
      // Network error — fall through to show modal
    }

    // Not verified — show OTP modal
    setPendingCallback(() => onVerified);
    setShowOtp(true);
  }, []);

  const handleVerified = useCallback((phone: string) => {
    setShowOtp(false);
    if (pendingCallback) {
      pendingCallback(phone);
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  const VerificationGate = showOtp ? (
    <OtpModal
      onVerified={handleVerified}
      onClose={() => {
        setShowOtp(false);
        setPendingCallback(null);
      }}
    />
  ) : null;

  return { requireVerification, VerificationGate };
}
