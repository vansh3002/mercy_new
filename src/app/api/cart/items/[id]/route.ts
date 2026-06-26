import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { getOrCreateCart, removeItem, updateQty } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const cartId = ensureCartId();
  getOrCreateCart(cartId);
  const body = (await req.json().catch(() => ({}))) as { qty?: number };
  const qty = Number.isFinite(body.qty) ? Number(body.qty) : 1;
  const updated = updateQty(cartId, params.id, qty);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const cartId = ensureCartId();
  getOrCreateCart(cartId);
  const updated = removeItem(cartId, params.id);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}
