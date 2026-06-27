import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { getOrCreateCart, applyCoupon } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";

export async function GET() {
  const cartId = await ensureCartId();
  const cart = await getOrCreateCart(cartId);
  const view = await buildCartView(cart);
  return NextResponse.json({ cart: view });
}

export async function POST(req: Request) {
  // Apply or remove a coupon: { code: "WOMANIA100" }
  const cartId = await ensureCartId();
  const body = (await req.json().catch(() => ({}))) as { code?: string };
  const updated = await applyCoupon(cartId, body.code ?? "");
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}
