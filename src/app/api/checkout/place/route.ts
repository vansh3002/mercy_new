import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { clearCart, getOrCreateCart, cartConfig } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { nextOrderId, saveOrder } from "@/features/orders/store";
import type { PlaceOrderInput } from "@/features/checkout/types";
import type { Order } from "@/features/orders/types";

const ADDRESS_FIELDS = ["name", "phone", "line1", "city", "state", "pincode"] as const;

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
  if (input.paymentMethod !== "UPI" && input.paymentMethod !== "CARD" && input.paymentMethod !== "COD") {
    return "invalid_payment";
  }
  return null;
}

export async function POST(req: Request) {
  const cartId = ensureCartId();
  const cart = getOrCreateCart(cartId);
  const body = (await req.json().catch(() => ({}))) as Partial<PlaceOrderInput>;

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const view = await buildCartView(cart);
  if (view.lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  // simulate gateway latency
  await new Promise((r) => setTimeout(r, 600));

  const codFee = body.paymentMethod === "COD" ? cartConfig.COD_FEE : 0;

  const id = nextOrderId();
  const eta = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);
  const order: Order = {
    id,
    createdAt: new Date().toISOString(),
    status: "out_for_delivery",
    lines: view.lines,
    address: body.address!,
    paymentMethod: body.paymentMethod!,
    totals: {
      subtotal: view.totals.subtotal,
      discount: view.totals.discount,
      shipping: view.totals.shipping,
      codFee,
      total: view.totals.total + codFee,
      youSave: view.totals.youSave,
    },
    etaLabel: eta.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
  };
  saveOrder(order);
  clearCart(cartId);
  return NextResponse.json({ orderId: id });
}
