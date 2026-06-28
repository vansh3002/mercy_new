import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { clearCart, getOrCreateCart, cartConfig } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { prisma } from "@/lib/prisma";
import { notifyOrderPlaced } from "@/lib/mailer";
import type { PlaceOrderInput } from "@/features/checkout/types";

const ADDRESS_FIELDS = ["name", "phone", "line1", "city", "state", "pincode"] as const;

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WM${ts}${rand}`;
}

function validate(input: Partial<PlaceOrderInput>): string | null {
  if (!input.address) return "missing_address";
  for (const k of ADDRESS_FIELDS) {
    const v = (input.address as unknown as Record<string, unknown>)[k];
    if (typeof v !== "string" || v.trim().length === 0) {
      return `missing_${k}`;
    }
  }
  if (!/^\d{6}$/.test(input.address.pincode)) return "invalid_pincode";
  if (!/^[6-9]\d{9}$/.test(input.address.phone.replace(/\D/g, ""))) {
    return "invalid_phone";
  }
  if (
    input.paymentMethod !== "UPI" &&
    input.paymentMethod !== "CARD" &&
    input.paymentMethod !== "COD"
  ) {
    return "invalid_payment";
  }
  return null;
}

export async function POST(req: Request) {
  const cartId = await ensureCartId();
  const body = (await req.json().catch(() => ({}))) as Partial<PlaceOrderInput>;

  const err = validate(body);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }

  // Cart is now persisted in DB ,always reliable
  const cart = await getOrCreateCart(cartId);
  const view = await buildCartView(cart);

  if (view.lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const codFee = body.paymentMethod === "COD" ? cartConfig.COD_FEE : 0;
  const finalAmt = view.totals.total + codFee;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify and deduct stock for each cart item
      for (const line of view.lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product) {
          throw new Error(`product_not_found:${line.productId}`);
        }

        const inv = (product.sizeInventory ?? {}) as Record<string, number>;
        const available = inv[line.size] ?? 0;

        if (available < line.qty) {
          throw new Error(`insufficient_stock:${product.title}:${line.size}`);
        }

        inv[line.size] = available - line.qty;
        await tx.product.update({
          where: { id: line.productId },
          data: { sizeInventory: inv },
        });
      }

      // 2. Create order in PostgreSQL
      return await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: body.address!.name,
          phone: body.address!.phone,
          email: null,
          address: `${body.address!.line1}${body.address!.line2 ? ", " + body.address!.line2 : ""}`,
          city: body.address!.city,
          state: body.address!.state,
          pincode: body.address!.pincode,
          items: view.lines as any,
          subtotal: view.totals.subtotal,
          shippingCharge: view.totals.shipping + codFee,
          discount: view.totals.discount,
          finalAmount: finalAmt,
          paymentMethod: body.paymentMethod!,
          paymentStatus: body.paymentMethod === "COD" ? "PENDING" : "SUCCESS",
          orderStatus: "UNDER_PACKAGING",
        },
      });
    });

    // Clear the DB cart
    await clearCart(cartId);

    // Fire-and-forget email notification
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

    return NextResponse.json({ orderId: order.id });
  } catch (err: any) {
    const msg = err.message || "unknown_error";
    if (msg.startsWith("product_not_found:")) {
      return NextResponse.json({ error: "Product not found in database" }, { status: 404 });
    }
    if (msg.startsWith("insufficient_stock:")) {
      const parts = msg.split(":");
      console.error("[POST /api/checkout/place] Stock error ,product:", parts[1], "size:", parts[2]);
      return NextResponse.json(
        { error: "insufficient_stock", productTitle: parts[1], size: parts[2] },
        { status: 400 },
      );
    }
    console.error("[POST /api/checkout/place] Error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
