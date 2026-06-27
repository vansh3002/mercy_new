import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY!;
const MAX_ATTEMPTS = 5;

/**
 * Sends an OTP via 2Factor API (AUTOGEN route).
 * Returns the session ID that 2Factor gives back — required for verification.
 */
async function sendOtpViaTwoFactor(phone: string): Promise<string | null> {
  try {
    // 2Factor expects the number WITHOUT +91, just the 10-digit number
    const url = `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${phone}/AUTOGEN`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      Status: string;
      Details: string;
      OTP?: string;
    };

    if (process.env.NODE_ENV !== "production") {
      // In dev, log response (includes OTP for testing)
      console.log("[send-otp] 2Factor response:", data);
    }

    if (data.Status === "Success" && data.Details) {
      return data.Details; // This is the session ID
    }

    console.error("[send-otp] 2Factor error:", data);
    return null;
  } catch (err) {
    console.error("[send-otp] 2Factor network error:", err);
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: string };
  const phone = (body.phone ?? "").replace(/\D/g, "").slice(-10);

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  // Rate-limit: check existing record for too many sends
  const existing = await prisma.otp.findUnique({ where: { phone } });
  if (existing && existing.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const sessionId = await sendOtpViaTwoFactor(phone);

  if (!sessionId) {
    return NextResponse.json({ error: "otp_send_failed" }, { status: 502 });
  }

  // Upsert: store session ID for this phone (replaces any previous session)
  await prisma.otp.upsert({
    where: { phone },
    update: { sessionId, attempts: 0, updatedAt: new Date() },
    create: { phone, sessionId },
  });

  return NextResponse.json({ success: true });
}
