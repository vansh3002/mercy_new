import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCartIdAsync } from "@/lib/cart-cookie";
import { mergeCartFromPhone } from "@/features/cart/store";
import { prisma } from "@/lib/prisma";
import { notifyNewCustomer } from "@/lib/mailer";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { phone?: string };
  const phone = (body.phone ?? "").replace(/\D/g, "").slice(-10);

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  // Check if this is a first-time or returning customer before upsert
  const existing = await prisma.customer.findUnique({ where: { phone } });

  // Upsert customer ,creates on first visit, returns saved wishlist on repeat
  const customer = await prisma.customer.upsert({
    where: { phone },
    create: { phone, wishlist: [] },
    update: { updatedAt: new Date() },
  });

  // Fire-and-forget email alert (never blocks the response)
  notifyNewCustomer(phone, !existing);

  // Merge any existing cart for this phone into the current device's cart
  const cartId = await getCartIdAsync();
  if (cartId) {
    try {
      await mergeCartFromPhone(cartId, phone);
    } catch {
      // Cart may not exist yet ,safe to ignore
    }
  }

  // Set wm_phone cookie ,marks this session as phone-confirmed for 30 days
  const cookieStore = await cookies();
  cookieStore.set("wm_phone", phone, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  // Return customer's saved wishlist so the client can merge it into localStorage
  const wishlist = Array.isArray(customer.wishlist) ? customer.wishlist as string[] : [];
  return NextResponse.json({ success: true, phone, wishlist });
}
