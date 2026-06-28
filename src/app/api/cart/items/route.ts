import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureCartId } from "@/lib/cart-cookie";
import { addItem, getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";
import { notifyAddToBag } from "@/lib/mailer";
import type { Size } from "@/features/products/types";

const VALID_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export async function POST(req: Request) {
  const cartId = await ensureCartId();
  await getOrCreateCart(cartId);
  const body = (await req.json().catch(() => ({}))) as {
    productId?: string;
    size?: Size;
    qty?: number;
  };
  if (!body.productId || !body.size || !VALID_SIZES.includes(body.size)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const updated = await addItem(cartId, {
    productId: body.productId,
    size: body.size,
    qty: Number.isFinite(body.qty) ? Number(body.qty) : 1,
  });
  const view = await buildCartView(updated);

  // Fire-and-forget email alert
  const jar = await cookies();
  const phone = jar.get("wm_phone")?.value ?? null;
  const addedLine = view.lines.find((l) => l.productId === body.productId && l.size === body.size);
  if (addedLine) {
    notifyAddToBag(phone, addedLine.title, body.size!);
  }

  return NextResponse.json({ cart: view });
}
