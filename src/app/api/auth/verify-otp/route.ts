import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCartIdAsync } from "@/lib/cart-cookie";
import { linkCartToPhone } from "@/features/cart/store";

const MAX_ATTEMPTS = 5;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    phone?: string;
    code?: string;
  };
  const phone = (body.phone ?? "").replace(/\D/g, "").slice(-10);
  const code = (body.code ?? "").trim();

  if (!phone || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const record = await prisma.otp.findUnique({ where: { phone } });

  if (!record) {
    return NextResponse.json({ error: "otp_not_found" }, { status: 404 });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  if (new Date() > record.expiresAt) {
    await prisma.otp.delete({ where: { phone } });
    return NextResponse.json({ error: "otp_expired" }, { status: 400 });
  }

  if (record.code !== code) {
    await prisma.otp.update({
      where: { phone },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - record.attempts - 1;
    return NextResponse.json({ error: "wrong_otp", remaining }, { status: 400 });
  }

  // ✅ OTP correct — clean up OTP record
  await prisma.otp.delete({ where: { phone } });

  // ✅ Link cart to phone (cart is now owned by this phone number)
  const cartId = await getCartIdAsync();
  if (cartId) {
    try {
      await linkCartToPhone(cartId, phone);
      console.log(`[verify-otp] Cart ${cartId} linked to phone ${phone}`);
    } catch (e) {
      // Cart may not exist yet — that's fine, it gets created on next add
      console.log("[verify-otp] Could not link cart (may not exist yet):", e);
    }
  }

  // ✅ Set wm_phone session cookie (30 days)
  const cookieStore = await cookies();
  cookieStore.set("wm_phone", phone, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return NextResponse.json({ success: true, phone });
}
