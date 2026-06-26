import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { addItem, getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import type { Size } from "@/features/products/types";

const VALID_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export async function POST(req: Request) {
  const cartId = ensureCartId();
  getOrCreateCart(cartId);
  const body = (await req.json().catch(() => ({}))) as {
    productId?: string;
    size?: Size;
    qty?: number;
  };
  if (!body.productId || !body.size || !VALID_SIZES.includes(body.size)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const updated = addItem(cartId, {
    productId: body.productId,
    size: body.size,
    qty: Number.isFinite(body.qty) ? Number(body.qty) : 1,
  });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}
