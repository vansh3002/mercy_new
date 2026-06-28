import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { ensureCartId } from "@/lib/cart-cookie";
import { getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";

// POST /api/razorpay/create-order
// Creates a Razorpay order for the current cart total.
export async function POST() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("[razorpay/create-order] Keys not set in environment");
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const cartId = await ensureCartId();
    const cart = await getOrCreateCart(cartId);
    const view = await buildCartView(cart);

    if (view.lines.length === 0) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const amountInPaise = Math.round(view.totals.total * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wm_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      rzpOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("[razorpay/create-order]", err);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
