import { NextResponse } from "next/server";
import { ensureCartId } from "@/lib/cart-cookie";
import { updateQty, removeItem } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cartId = await ensureCartId();
  const body = (await req.json().catch(() => ({}))) as { qty?: number };
  if (typeof body.qty !== "number") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const updated = await updateQty(cartId, id, body.qty);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cartId = await ensureCartId();
  const updated = await removeItem(cartId, id);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const view = await buildCartView(updated);
  return NextResponse.json({ cart: view });
}
