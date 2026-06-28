import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureCartId } from "@/lib/cart-cookie";
import { getOrCreateCart, clearCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { notifyOrderPlaced } from "@/lib/mailer";
import type { Address } from "@/features/checkout/types";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WM${ts}${rand}`;
}

const ADDRESS_REQUIRED = ["name", "phone", "city", "state", "pincode"] as const;

function validateAddress(address: Address): string | null {
  for (const k of ADDRESS_REQUIRED) {
    const v = (address as unknown as Record<string, unknown>)[k];
    if (typeof v !== "string" || v.trim().length === 0) return `missing_${k}`;
  }
  if (!/^\d{6}$/.test(address.pincode)) return "invalid_pincode";
  if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, ""))) return "invalid_phone";
  // At least one of line1/line2 must be non-empty
  if (!address.line1?.trim() && !address.line2?.trim()) return "missing_address_line";
  return null;
}

// POST /api/razorpay/verify
// Verifies Razorpay payment signature, then creates the order in DB.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    address?: Address;
  };

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, address } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !address) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const addrErr = validateAddress(address);
  if (addrErr) {
    return NextResponse.json({ error: addrErr }, { status: 400 });
  }

  // 1. Verify HMAC-SHA256 signature
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    console.error("[POST /api/razorpay/verify] Signature mismatch");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // 2. Load cart
  const cartId = await ensureCartId();
  const cart = await getOrCreateCart(cartId);
  const view = await buildCartView(cart);

  if (view.lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Deduct inventory
      for (const line of view.lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product) throw new Error(`product_not_found:${line.productId}`);

        const inv = (product.sizeInventory ?? {}) as Record<string, number>;
        const available = inv[line.size] ?? 0;
        if (available < line.qty) throw new Error(`insufficient_stock:${product.title}:${line.size}`);

        inv[line.size] = available - line.qty;
        await tx.product.update({ where: { id: line.productId }, data: { sizeInventory: inv } });
      }

      // Create order
      return await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: address.name,
          phone: address.phone,
          email: null,
          address: `${address.line1}${address.line2 ? ", " + address.line2 : ""}`,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          items: view.lines as any,
          subtotal: view.totals.subtotal,
          shippingCharge: view.totals.shipping,
          discount: view.totals.discount,
          finalAmount: view.totals.total,
          paymentMethod: "RAZORPAY",
          paymentStatus: "SUCCESS",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          orderStatus: "UNDER_PACKAGING",
        },
      });
    });

    await clearCart(cartId);

    notifyOrderPlaced({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: order.items as any,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      discount: order.discount,
      finalAmount: order.finalAmount,
      paymentMethod: order.paymentMethod,
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    const msg = err.message || "";
    if (msg.startsWith("insufficient_stock:")) {
      const parts = msg.split(":");
      return NextResponse.json(
        { error: "insufficient_stock", productTitle: parts[1], size: parts[2] },
        { status: 400 },
      );
    }
    console.error("[POST /api/razorpay/verify]", err);
    return NextResponse.json({ error: "order_creation_failed" }, { status: 500 });
  }
}
